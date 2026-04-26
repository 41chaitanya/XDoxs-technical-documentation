// MongoDB connection
import { MongoClient } from 'mongodb';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Handle both Astro (import.meta.env) and Node scripts (process.env)
const MONGODB_URI = (typeof import.meta !== 'undefined' && import.meta.env?.MONGODB_URI) 
  || process.env.MONGODB_URI 
  || 'mongodb://localhost:27017/xdoxs';

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  client = new MongoClient(MONGODB_URI);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export async function getDb() {
  const client = await clientPromise;
  return client.db('xdoxs');
}

export default clientPromise;
