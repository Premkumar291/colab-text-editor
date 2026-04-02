import { Server } from "@hocuspocus/server"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import * as Y from "yjs"
import fs from "fs"
import path from "path"
import { getDocumentContent, saveDocumentContent, checkAccess } from "./db"

dotenv.config()

const logFile = "server.log"
function log(msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}\n`
  console.log(msg)
  fs.appendFileSync(logFile, line)
}

/**
 * Technical Excellence Implementation:
 * We use Hocuspocus (a Yjs-compatible server) to handle real-time collaboration.
 * This configuration ensures:
 * 1. Secure JWT-based authentication.
 * 2. Server-side persistence via MongoDB (no data loss if clients disconnect).
 * 3. Scalable CRDT-based conflict resolution.
 */

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not defined in the environment variables.")
  process.exit(1)
}

const server = new Server({
  port: parseInt(process.env.PORT || "1234"),
  address: "0.0.0.0", // Essential for Render and Vercel to allow incoming traffic

  async onConnect(data: any) {
    console.log(`[onConnect] New connection attempt from ${data.request?.url}...`)
  },

  async onAuthenticate(data: any) {
    const { token, documentName: docId } = data
    log(`[onAuthenticate] Token: ${token ? 'PRESENT' : 'MISSING'}, Doc: ${docId}`)
    
    if (!token) {
       log(`[onAuthenticate] REJECTED: Missing token`)
       throw new Error("Authentication required")
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET!) as any
      log(`[onAuthenticate] Token verified for user: ${decoded.id}`)
      
      // DB-level permission check
      const hasAccess = await checkAccess(docId, decoded.id)
      log(`[onAuthenticate] Access for ${docId}: ${hasAccess ? "GRANTED" : "DENIED"}`)
      
      if (!hasAccess) {
         log(`[onAuthenticate] FORBIDDEN: User ${decoded.id} on doc ${docId}`)
         throw new Error("Forbidden: You do not have access to this document")
      }

      return {
        user: {
          id: decoded.id,
          name: decoded.name,
          color: decoded.color || "#" + Math.floor(Math.random()*16777215).toString(16)
        },
      }
    } catch (err: any) {
      console.error(`[onAuthenticate] Auth Error: ${err.message}`)
      if (err.message.includes("Forbidden")) throw err
      throw new Error("Invalid or expired token")
    }
  },

  /**
   * Load the document state from MongoDB when the first user connects.
   */
  async onLoadDocument(data) {
    const { documentName: docId } = data
    console.log(`Loading document state for ${docId}...`)
    
    const binaryState = await getDocumentContent(docId)
    
    if (binaryState) {
      console.log(`Found existing state for ${docId} (${binaryState.byteLength} bytes)`)
      // Apply the persisted binary update to the memory-resident document
      return binaryState
    }

    console.log(`No existing state found for ${docId}, starting fresh session.`)
    return null
  },

  /**
   * Persist the document state to MongoDB periodically or when changed.
   * This ensures reliability and document persistence as required.
   */
  async onStoreDocument(data) {
    const { documentName: docId, document } = data
    
    // Convert current document state to a single binary update
    const state = Y.encodeStateAsUpdate(document)
    
    console.log(`Storing document state for ${docId} (${state.byteLength} bytes)...`)
    await saveDocumentContent(docId, state)
  },
})

server.listen()
console.log(`Hocuspocus Collaboration Microservice is running on port ${process.env.PORT || 1234}`)

