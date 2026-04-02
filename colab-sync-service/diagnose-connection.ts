import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { connectDB, checkAccess } from './db';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

async function diagnose() {
  console.log('--- STARTING DIAGNOSTIC ---');
  console.log('MONGODB_URI:', MONGODB_URI ? 'Defined' : 'UNDEFINED');
  console.log('JWT_SECRET:', JWT_SECRET ? 'Defined' : 'UNDEFINED');

  try {
    console.log('\n1. Testing MongoDB Connection...');
    await connectDB();
    console.log('SUCCESS: Connected to MongoDB.');

    console.log('\n2. Listing Collections...');
    const collections = await mongoose.connection.db!.listCollections().toArray();
    console.log('Collections in DB:', collections.map(c => c.name).join(', '));

    const hasDocs = collections.some(c => c.name === 'documents');
    if (!hasDocs) {
      console.error('CRITICAL: "documents" collection NOT FOUND!');
    } else {
      const docCount = await mongoose.connection.collection('documents').countDocuments();
      console.log(`SUCCESS: "documents" collection exists with ${docCount} records.`);
      
      if (docCount > 0) {
        const sampleDoc = await mongoose.connection.collection('documents').findOne({});
        console.log('Sample Document raw data:', JSON.stringify(sampleDoc, null, 2));
        console.log('Sample Doc ID:', sampleDoc?.docId, 'Type:', typeof sampleDoc?.docId);
        console.log('Sample Doc Owner:', sampleDoc?.owner, 'Type:', typeof sampleDoc?.owner);
      }
    }

    console.log('\n3. Testing checkAccess Logic...');
    // We try to find any doc to test access
    const testDoc = await mongoose.connection.collection('documents').findOne({});
    if (testDoc) {
      const result = await checkAccess(testDoc.docId, testDoc.owner);
      console.log(`Access Test (Owner): ${result ? 'PASSED' : 'FAILED'}`);
      
      const fakeResult = await checkAccess(testDoc.docId, 'non-existent-user');
      console.log(`Access Test (Non-owner): ${fakeResult ? 'BLOCKED' : 'FAILED (Allowed Access!)'}`);
    } else {
      console.log('SKIPPING: No documents to test access logic.');
    }

  } catch (err: any) {
    console.error('\nDIAGNOSTIC FAILED:', err.message);
  } finally {
    console.log('\n--- DIAGNOSTIC COMPLETE ---');
    process.exit(0);
  }
}

diagnose();
