import { MongoClient } from 'mongodb'
import dotenv from "dotenv";
dotenv.config({ path: "./.env.local" });

const uri = process.env.MONGODB_URI
const options = {}

let clientPromise

if (!process.env.MONGODB_URI) {
    throw new Error('Please add your Mongo URI to .env.local')
}

clientPromise = MongoClient.connect(uri, options)

export async function getDB() {
    const client = await clientPromise;
    const db = await client.db("focumoji");
    return db;
}
