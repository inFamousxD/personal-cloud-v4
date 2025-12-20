import { Db, MongoClient } from "mongodb";
import dotenv from 'dotenv';

dotenv.config();
let db: Db;
const client = new MongoClient(process.env.MONGODB_ATLAS_CONNECTION || '');

console.log(process.env.MONGODB_ATLAS_CONNECTION)

async function connectDB() {
    try {
        await client.connect();
        db = client.db(); // Uses default database from connection string
        console.log('Connected to MongoDB Atlas');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

export { db, client, connectDB };
