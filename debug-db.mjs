import connectToDatabase from "./lib/db.js"
import DocumentModel from "./models/Document.js"
import { v4 as uuidv4 } from "uuid"

async function testConnection() {
  try {
    console.log("Connecting...")
    await connectToDatabase()
    console.log("Connected!")
    
    const docId = uuidv4()
    console.log("Generated ID:", docId)
    
    const doc = await DocumentModel.create({
      docId,
      name: "Test Doc",
      owner: "test-user-id",
      collaborators: []
    })
    console.log("Doc Created! ID:", doc.id)
    
    await DocumentModel.findByIdAndDelete(doc.id)
    console.log("Doc Cleaned Up!")
    process.exit(0)
  } catch (err) {
    console.error("DEBUG ERROR:", err)
    process.exit(1)
  }
}

testConnection()
