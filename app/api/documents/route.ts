import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import DocumentModel from "@/models/Document"
import { getAuthToken, verifyToken } from "@/lib/auth-utils"
import crypto from "crypto"

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const token = await getAuthToken()
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectToDatabase()

    // Get all documents where the user is either the owner or a collaborator
    const documents = await DocumentModel.find({
      $or: [
        { owner: decoded.id },
        { "collaborators.userId": decoded.id }
      ]
    })
    .select("docId name owner updatedAt collaborators")
    .sort({ updatedAt: -1 })
    .lean()

    // Map to include the user's role in the response
    const formattedDocs = documents.map(doc => {
      let role = "owner"
      if (doc.owner !== decoded.id) {
        const collaborator = doc.collaborators.find((c: any) => c.userId === decoded.id)
        role = collaborator ? collaborator.role : "read"
      }
      
      return {
        docId: doc.docId,
        name: doc.name,
        role,
        updatedAt: doc.updatedAt,
        isOwner: doc.owner === decoded.id
      }
    })

    return NextResponse.json({ documents: formattedDocs })
  } catch (err: any) {
    console.error("List Documents Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getAuthToken()
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    let body = { name: "Untitled Document" }
    try {
      const jsonBody = await req.json()
      if (jsonBody.name) body.name = jsonBody.name
    } catch (e) {
      // Body might be empty, use defaults
    }

    await connectToDatabase()

    const docId = crypto.randomUUID()
    
    const document = await DocumentModel.create({
      docId,
      name: body.name,
      owner: decoded.id,
      content: null,
      collaborators: [],
    })

    return NextResponse.json({ 
      success: true, 
      document: {
        docId: document.docId,
        name: document.name,
        updatedAt: document.updatedAt
      } 
    })
  } catch (err: any) {
    console.error("Create Document Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
