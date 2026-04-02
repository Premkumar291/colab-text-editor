import mongoose, { Schema, model, models } from "mongoose"

export interface ICollaborator {
  userId: string
  role: "edit" | "read"
}

export interface IDocument {
  docId: string
  name: string
  content?: Buffer
  owner: string
  collaborators: ICollaborator[]
}

const CollaboratorSchema = new Schema<ICollaborator>({
  userId: { type: String, required: true },
  role: { type: String, enum: ["edit", "read"], default: "read" },
})

const DocumentSchema = new Schema<IDocument>(
  {
    docId: { type: String, required: true, unique: true },
    name: { type: String, default: "Untitled Document" },
    content: { type: Buffer },
    owner: { type: String, required: true },
    collaborators: { type: [CollaboratorSchema], default: [] },
  },
  { timestamps: true }
)

// Index for fast lookups by docId and owner/collaborators
DocumentSchema.index({ docId: 1 })
DocumentSchema.index({ owner: 1 })
DocumentSchema.index({ "collaborators.userId": 1 })

const DocumentModel = models.Document || model<IDocument>("Document", DocumentSchema)

export default DocumentModel
