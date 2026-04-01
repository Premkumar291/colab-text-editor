import mongoose, { Schema, model, models } from "mongoose"

export interface IDocument {
  id: string
  title: string
  content: string
  ownerId?: string
  lastUpdatedBy?: string
  createdAt: Date
  updatedAt: Date
}

const DocumentSchema = new Schema<IDocument>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, default: "Untitled Document" },
    content: { type: String, default: "" },
    ownerId: { type: String },
    lastUpdatedBy: { type: String },
  },
  { timestamps: true }
)

const DocumentModel = models.Document || model<IDocument>("Document", DocumentSchema)

export default DocumentModel
