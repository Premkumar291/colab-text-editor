import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import DocumentModel from "@/models/Document"
import UserModel from "@/models/User"
import { getAuthToken, verifyToken } from "@/lib/auth-utils"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  try {
    const { docId } = await params
    const { email, role } = await req.json()

    if (!email || !role) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const token = await getAuthToken()
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectToDatabase()

    const document = await DocumentModel.findOne({ docId })
    if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 })

    // Only owner can share
    if (document.owner !== decoded.id) {
      return NextResponse.json({ error: "Only the owner can share" }, { status: 403 })
    }

    const collaboratorUser = await UserModel.findOne({ email })
    if (!collaboratorUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Don't allow sharing with yourself
    if (collaboratorUser.id === decoded.id) {
      return NextResponse.json({ error: "You are already the owner" }, { status: 400 })
    }

    // Check if already a collaborator
    const existingIndex = document.collaborators.findIndex(
      (c: any) => c.userId === collaboratorUser.id
    )

    if (existingIndex > -1) {
      document.collaborators[existingIndex].role = role
    } else {
      document.collaborators.push({ userId: collaboratorUser.id, role })
    }

    await document.save()

    return NextResponse.json({ 
      success: true, 
      message: `${role === "edit" ? "Editor" : "Viewer"} added: ${collaboratorUser.name}` 
    })
  } catch (err: any) {
    console.error("Share Document Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
