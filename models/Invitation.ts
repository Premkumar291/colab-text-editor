import mongoose, { Schema, model, models } from "mongoose"

export interface IInvitation {
  docId: string
  docName: string
  inviterId: string
  inviterName: string
  inviteeId: string
  role: "edit" | "read"
  status: "pending" | "accepted" | "rejected"
}

const InvitationSchema = new Schema<IInvitation>(
  {
    docId: { type: String, required: true },
    docName: { type: String, required: true },
    inviterId: { type: String, required: true },
    inviterName: { type: String, required: true },
    inviteeId: { type: String, required: true },
    role: { type: String, enum: ["edit", "read"], default: "read" },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  },
  { timestamps: true }
)

// Index for fast lookups by invitee and status
InvitationSchema.index({ inviteeId: 1, status: 1 })
InvitationSchema.index({ docId: 1, inviteeId: 1 })

const InvitationModel = models.Invitation || model<IInvitation>("Invitation", InvitationSchema)

export default InvitationModel
