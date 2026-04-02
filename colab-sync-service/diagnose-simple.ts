import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './db';

dotenv.config();

async function diagnose() {
  try {
    await connectDB();
    const doc = await mongoose.connection.collection('documents').findOne({});
    if (doc) {
      console.log('DIAG_DOC_ID:' + doc.docId);
      console.log('DIAG_OWNER:' + doc.owner);
      console.log('DIAG_OWNER_TYPE:' + typeof doc.owner);
      console.log('DIAG_COLLABORATORS_COUNT:' + (doc.collaborators?.length || 0));
    } else {
      console.log('DIAG_NO_DOCS');
    }
  } catch (err: any) {
    console.log('DIAG_ERR:' + err.message);
  } finally {
    process.exit(0);
  }
}

diagnose();
