import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function repairDocs() {
  await mongoose.connect(MONGODB_URI!);
  console.log('Connected to DB for repair...');
  
  // Fix documents where owner is same as docId (corrupted during create)
  // We'll set them to user '1' (the primary user Vishnu) as a fallback for this environment.
  const result = await mongoose.connection.collection('documents').updateMany(
    { $expr: { $eq: ['$owner', '$docId'] } },
    { $set: { owner: '1' } }
  );
  
  console.log(`Matched ${result.matchedCount} docs, Updated ${result.modifiedCount} docs.`);
  
  process.exit(0);
}

repairDocs();
