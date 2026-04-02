import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import DocumentModel from "@/models/Document"
import { getAuthToken, verifyToken } from "@/lib/auth-utils"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  try {
    const { docId } = await params
    const token = await getAuthToken()
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectToDatabase()

    let document = await DocumentModel.findOne({ docId }).lean()

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Authorization check
    const isOwner = document.owner === decoded.id
    const collaborator = document.collaborators.find((c: any) => c.userId === decoded.id)
    
    if (!isOwner && !collaborator) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 })
    }

    const role = isOwner ? "owner" : collaborator.role

    // Hydrate collaborator information for the owner's management view
    let hydratedCollaborators = []
    if (isOwner) {
      const { default: UserModel } = await import("@/models/User")
      const collaboratorIds = document.collaborators.map((c: any) => c.userId)
      const users = await UserModel.find({ id: { $in: collaboratorIds } }).select("id name email color avatar").lean()
      
      hydratedCollaborators = document.collaborators.map((c: any) => {
        const userData = users.find((u: any) => u.id === c.userId)
        return {
          ...c,
          name: userData?.name || "Unknown User",
          email: userData?.email || "No email",
          color: userData?.color,
          avatar: userData?.avatar
        }
      })
    }

    return NextResponse.json({
      document: {
        docId: document.docId,
        name: document.name,
        // Convert Buffer to base64 for JSON transmission
        content: document.content ? document.content.toString("base64") : null,
        collaborators: hydratedCollaborators,
        owner: document.owner
      },
      role,
    })
  } catch (err: any) {
    console.error("Fetch Document Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  try {
    const { docId } = await params
    const { name, removeCollaboratorId } = await req.json()
    
    const token = await getAuthToken()
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectToDatabase()

    const document = await DocumentModel.findOne({ docId }).lean()
    if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 })

    // Authorization: Must be owner or have edit role
    const isOwner = document.owner === decoded.id
    const collaborator = document.collaborators.find((c: any) => c.userId === decoded.id)
    const canEdit = isOwner || (collaborator && collaborator.role === "edit")

    if (!canEdit) {
      return NextResponse.json({ error: "No edit permissions" }, { status: 403 })
    }

    const updates: any = {}
    if (name !== undefined) {
      updates.name = name
    }

    // Handle collaborator removal (Owner only)
    if (removeCollaboratorId) {
      if (!isOwner) {
        return NextResponse.json({ error: "Only the owner can remove collaborators" }, { status: 403 })
      }
      
      await DocumentModel.findOneAndUpdate(
        { docId },
        { $pull: { collaborators: { userId: removeCollaboratorId } } }
      )
      
      return NextResponse.json({ success: true, message: "Collaborator removed" })
    }

    const updatedDoc = await DocumentModel.findOneAndUpdate(
      { docId },
      { $set: updates },
      { new: true }
    )

    return NextResponse.json({ success: true, name: updatedDoc?.name })
  } catch (err: any) {
    console.error("Save Document Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  const { docId } = await params
  try {
    const token = await getAuthToken()
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectToDatabase()

    const document = await DocumentModel.findOne({ docId }).lean()
    if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 })

    // Only the owner can delete the document
    if (document.owner !== decoded.id) {
      return NextResponse.json({ error: "Only the owner can delete this document" }, { status: 403 })
    }

    await DocumentModel.deleteOne({ docId })

    return NextResponse.json({ success: true, message: "Document deleted successfully" })
  } catch (err: any) {
    console.error("Delete Document Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
