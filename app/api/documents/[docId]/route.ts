import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import DocumentModel from "@/models/Document"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  try {
    await connectToDatabase()
    const { docId } = await params

    let document = await DocumentModel.findOne({ id: docId })

    if (!document) {
      // Create a default document if it doesn't exist
      document = await DocumentModel.create({
        id: docId,
        title: "Untitled Document",
        content: "",
      })
    }

    return NextResponse.json(document)
  } catch (error: any) {
    console.error("GET Document Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  try {
    await connectToDatabase()
    const { docId } = await params
    const body = await request.json()

    const document = await DocumentModel.findOneAndUpdate(
      { id: docId },
      { $set: body },
      { new: true, runValidators: true }
    )

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    return NextResponse.json(document)
  } catch (error: any) {
    console.error("PATCH Document Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
