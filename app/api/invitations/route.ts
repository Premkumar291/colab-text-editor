import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import InvitationModel from "@/models/Invitation"
import DocumentModel from "@/models/Document"
import { getAuthToken, verifyToken } from "@/lib/auth-utils"

export async function GET(req: NextRequest) {
  try {
    const token = await getAuthToken()
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const decoded = await verifyToken(token)
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectToDatabase()

    // Get all pending invitations for the current user
    const invitations = await InvitationModel.find({ 
      inviteeId: decoded.id, 
      status: "pending" 
    }).sort({ createdAt: -1 })

    return NextResponse.json({ invitations })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { docId, inviteeId, role } = await req.json()

    if (!docId || !inviteeId || !role) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const token = await getAuthToken()
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const decoded = await verifyToken(token)
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectToDatabase()

    const doc = await DocumentModel.findOne({ docId })
    if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 })

    // Only owner can invite
    if (doc.owner !== decoded.id) {
      return NextResponse.json({ error: "Only the owner can invite" }, { status: 403 })
    }

    // Check if user is already a collaborator
    const isAlreadyCollaborator = doc.collaborators.some((c: any) => c.userId === inviteeId)
    if (isAlreadyCollaborator || doc.owner === inviteeId) {
      return NextResponse.json({ error: "User already has access" }, { status: 400 })
    }

    // Check if a pending invite already exists
    const existingInvite = await InvitationModel.findOne({ 
      docId, 
      inviteeId, 
      status: "pending" 
    })
    
    if (existingInvite) {
      return NextResponse.json({ error: "Invitation already pending" }, { status: 400 })
    }

    const invitation = await InvitationModel.create({
      docId,
      docName: doc.name,
      inviterId: decoded.id,
      inviterName: decoded.name,
      inviteeId,
      role,
      status: "pending",
    })

    return NextResponse.json({ success: true, invitation })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
