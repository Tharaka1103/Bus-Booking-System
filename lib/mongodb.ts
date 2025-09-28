import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri: string = process.env.MONGODB_URI;

let cachedClient: mongoose.Mongoose;
let cachedDb: mongoose.Connection;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    cachedClient = client;
    cachedDb = client.connection;

    console.log('Connected to MongoDB');
    return { client: cachedClient, db: cachedDb };
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}