import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function debugDoc() {
  await mongoose.connect(MONGODB_URI!);
  const docId = 'd692de36-672d-4bf1-829b-c965f0615e30';
  const doc = await mongoose.connection.collection('documents').findOne({ docId });
  
  if (doc) {
    console.log('--- DOCUMENT DEBUG ---');
    console.log('docId:', doc.docId);
    console.log('owner:', doc.owner);
    console.log('owner type:', typeof doc.owner);
    console.log('collaborators:', JSON.stringify(doc.collaborators, null, 2));
    console.log('--- END DEBUG ---');
  } else {
    console.log('Document NOOOOT found in collection "documents"');
    const collections = await mongoose.connection.db!.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
  }
  process.exit(0);
}

debugDoc();
