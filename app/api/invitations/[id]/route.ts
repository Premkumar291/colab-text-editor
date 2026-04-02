import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import InvitationModel from "@/models/Invitation"
import DocumentModel from "@/models/Document"
import { getAuthToken, verifyToken } from "@/lib/auth-utils"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { status } = await req.json()

    if (!["accepted", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const token = await getAuthToken()
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectToDatabase()

    const invitation = await InvitationModel.findById(id)
    if (!invitation) return NextResponse.json({ error: "Invitation not found" }, { status: 404 })

    // Only the invitee can accept/reject
    if (invitation.inviteeId !== decoded.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    if (invitation.status !== "pending") {
      return NextResponse.json({ error: "Invitation already processed" }, { status: 400 })
    }

    if (status === "accepted") {
      const document = await DocumentModel.findOne({ docId: invitation.docId })
      if (!document) {
        return NextResponse.json({ error: "Document no longer exists" }, { status: 404 })
      }

      // Add user to collaborators if not already there
      const isAlreadyCollaborator = document.collaborators.some((c: any) => c.userId === decoded.id)
      if (!isAlreadyCollaborator) {
        document.collaborators.push({ userId: decoded.id, role: invitation.role })
        await document.save()
      }
    }

    invitation.status = status
    await invitation.save()

    return NextResponse.json({ 
      success: true, 
      message: status === "accepted" ? "Invitation accepted!" : "Invitation rejected" 
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = await getAuthToken()
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectToDatabase()

    const invitation = await InvitationModel.findById(id)
    if (!invitation) return NextResponse.json({ error: "Invitation not found" }, { status: 404 })

    // Only inviter or invitee can delete/revoke
    if (invitation.inviterId !== decoded.id && invitation.inviteeId !== decoded.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    await InvitationModel.findByIdAndDelete(id)
    return NextResponse.json({ success: true, message: "Invitation revoked" })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
