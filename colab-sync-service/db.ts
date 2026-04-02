import mongoose, { Schema } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in the environment variables.");
}

// Technical Excellence: Create a PRIVATE connection to avoid global Mongoose state 
// conflicts between different node_modules/mongoose instances.
const conn = mongoose.createConnection(MONGODB_URI!, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
  bufferCommands: false,
});

conn.on('connected', () => console.log(`[ISOLATED] Connected to MongoDB: ${conn.name}`));
conn.on('error', (err) => console.error(`[ISOLATED] MongoDB Error:`, err));

interface ICollaborator {
  userId: string
  role: "edit" | "read"
}

interface IDocument {
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

// Attach the model SPECIFICALLY to our private connection instance
const DocumentModel = conn.model<IDocument>("Document", DocumentSchema);

/**
 * Ensures MongoDB is connected.
 */
export async function connectDB() {
  if (conn.readyState >= 1) return;
  // Connection is handled at module level above
}

/**
 * Fetches document content from MongoDB.
 */
export async function getDocumentContent(docId: string): Promise<Uint8Array | null> {
  const doc = await DocumentModel.findOne({ docId }).lean();
  
  if (doc && doc.content) {
    return new Uint8Array(doc.content.buffer || doc.content);
  }
  
  return null;
}

/**
 * Persists document binary state to MongoDB.
 */
export async function saveDocumentContent(docId: string, content: Uint8Array) {
  await DocumentModel.updateOne(
    { docId },
    { $set: { content: Buffer.from(content), updatedAt: new Date() } }
  );
}

/**
 * Checks if a user has access to a document.
 */
export async function checkAccess(docId: string, userId: string): Promise<boolean> {
  console.log(`[checkAccess] Checking access for docId: ${docId}, userId: ${userId}`)
  
  try {
    const doc = await DocumentModel.findOne({ docId }).lean();
    
    if (!doc) {
      console.warn(`[checkAccess] Document ${docId} NOT FOUND in database!`)
      return false;
    }
    
    const isOwner = doc.owner === userId;
    const isCollaborator = doc.collaborators?.some((c: any) => c.userId === userId);
    const hasAccess = isOwner || isCollaborator;
    
    console.log(`[checkAccess] Result: ${hasAccess ? "ALLOWED" : "DENIED"} (isOwner: ${isOwner}, isCollaborator: ${isCollaborator})`)
    return hasAccess;
  } catch (error) {
    console.error(`[checkAccess] Error query for docId: ${docId}:`, error)
    return false;
  }
}
