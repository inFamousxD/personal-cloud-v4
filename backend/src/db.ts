import { Db, MongoClient } from "mongodb";
import dotenv from 'dotenv';

dotenv.config();

let db: Db;
let client: MongoClient | null = null;
let isConnecting = false;

const MONGODB_URI = process.env.MONGODB_ATLAS_CONNECTION || '';

if (!MONGODB_URI) {
    throw new Error('Please define MONGODB_ATLAS_CONNECTION environment variable');
}

async function connectDB() {
    // If already connected, return
    if (client && db) {
        return { db, client };
    }

    // If currently connecting, wait
    if (isConnecting) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return connectDB();
    }

    try {
        isConnecting = true;
        
        // Create new client with connection pooling
        client = new MongoClient(MONGODB_URI, {
            maxPoolSize: 10,
            minPoolSize: 5,
            maxIdleTimeMS: 60000,
            serverSelectionTimeoutMS: 5000,
        });

        await client.connect();
        db = client.db(); // Uses default database from connection string
        
        console.log('Connected to MongoDB Atlas');
        isConnecting = false;
        
        return { db, client };
    } catch (error) {
        isConnecting = false;
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

export { db, client, connectDB };