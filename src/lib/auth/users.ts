// MongoDB-based user storage
import { getDb } from '../db/mongodb';
import { COLLECTIONS, type User as DBUser } from '../db/models';
import { hashPassword } from './password';
import { ObjectId } from 'mongodb';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: 'super_admin' | 'instructor' | 'student';
  createdAt: Date;
}

// Initialize default users
async function initializeDefaultUsers() {
  const db = await getDb();
  const usersCollection = db.collection<DBUser>(COLLECTIONS.USERS);
  
  const defaultUsers = [
    {
      email: 'admin@xdoxs.com',
      passwordHash: await hashPassword('ramram'),
      fullName: 'Super Admin',
      role: 'super_admin' as const,
      createdAt: new Date(),
    },
    {
      email: 'instructor@xdoxs.com',
      passwordHash: await hashPassword('ramram'),
      fullName: 'Instructor User',
      role: 'instructor' as const,
      createdAt: new Date(),
    },
    {
      email: 'student@xdoxs.com',
      passwordHash: await hashPassword('ramram'),
      fullName: 'Student User',
      role: 'student' as const,
      createdAt: new Date(),
    },
  ];
  
  for (const user of defaultUsers) {
    const exists = await usersCollection.findOne({ email: user.email });
    if (!exists) {
      await usersCollection.insertOne(user);
    }
  }
}

// Initialize on module load
initializeDefaultUsers().catch(console.error);

function mapDbUserToUser(dbUser: DBUser): User {
  return {
    id: dbUser._id?.toString() || '',
    email: dbUser.email,
    passwordHash: dbUser.passwordHash,
    fullName: dbUser.fullName,
    role: dbUser.role,
    createdAt: dbUser.createdAt,
  };
}

export async function createUser(data: {
  email: string;
  passwordHash: string;
  fullName: string;
  role?: 'student' | 'instructor';
}): Promise<User> {
  const db = await getDb();
  const usersCollection = db.collection<DBUser>(COLLECTIONS.USERS);
  
  const exists = await usersCollection.findOne({ email: data.email });
  if (exists) {
    throw new Error('User already exists');
  }

  const newUser: DBUser = {
    email: data.email,
    passwordHash: data.passwordHash,
    fullName: data.fullName,
    role: data.role || 'student',
    createdAt: new Date(),
  };

  const result = await usersCollection.insertOne(newUser);
  newUser._id = result.insertedId.toString();
  
  return mapDbUserToUser(newUser);
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = await getDb();
  const usersCollection = db.collection<DBUser>(COLLECTIONS.USERS);
  
  const user = await usersCollection.findOne({ email });
  return user ? mapDbUserToUser(user) : null;
}

export async function findUserById(id: string): Promise<User | null> {
  const db = await getDb();
  const usersCollection = db.collection<DBUser>(COLLECTIONS.USERS);
  
  const user = await usersCollection.findOne({ _id: new ObjectId(id) });
  return user ? mapDbUserToUser(user) : null;
}

export async function updateUserRole(userId: string, role: 'instructor' | 'student'): Promise<User | null> {
  const db = await getDb();
  const usersCollection = db.collection<DBUser>(COLLECTIONS.USERS);
  
  const result = await usersCollection.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $set: { role } },
    { returnDocument: 'after' }
  );
  
  return result ? mapDbUserToUser(result) : null;
}

export async function getAllUsers(): Promise<User[]> {
  const db = await getDb();
  const usersCollection = db.collection<DBUser>(COLLECTIONS.USERS);
  
  const users = await usersCollection.find({}).toArray();
  return users.map(mapDbUserToUser);
}
