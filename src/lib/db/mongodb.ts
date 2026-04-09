// MongoDB connection
import { MongoClient } from 'mongodb';

const MONGODB_URI = import.meta.env.MONGODB_URI || 'mongodb://localhost:27017/xdoxs';

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
