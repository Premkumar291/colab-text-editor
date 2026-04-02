import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function debugUsers() {
  await mongoose.connect(MONGODB_URI!);
  const users = await mongoose.connection.collection('users').find({}).toArray();
  
  console.log('--- USERS DEBUG ---');
  users.forEach(u => {
    console.log(`ID: ${u.id}, Email: ${u.email}, Name: ${u.name}`);
  });
  console.log('--- END DEBUG ---');
  process.exit(0);
}

debugUsers();
