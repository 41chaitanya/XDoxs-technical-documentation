// Seed default users to MongoDB
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const MONGODB_URI = 'mongodb://localhost:27017/xdoxs';

async function seedUsers() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('xdoxs');
    const usersCollection = db.collection('users');
    
    // Clear existing users (optional)
    // await usersCollection.deleteMany({});
    // console.log('🗑️  Cleared existing users');
    
    // Hash passwords
    const hashedPassword = await bcrypt.hash('ramram', 10);
    
    const defaultUsers = [
      {
        email: 'admin@xdoxs.com',
        passwordHash: hashedPassword,
        fullName: 'Super Admin',
        role: 'super_admin',
        createdAt: new Date(),
      },
      {
        email: 'instructor@xdoxs.com',
        passwordHash: hashedPassword,
        fullName: 'Instructor User',
        role: 'instructor',
        createdAt: new Date(),
      },
      {
        email: 'student@xdoxs.com',
        passwordHash: hashedPassword,
        fullName: 'Student User',
        role: 'student',
        createdAt: new Date(),
      },
    ];
    
    // Insert users (skip if already exists)
    for (const user of defaultUsers) {
      const exists = await usersCollection.findOne({ email: user.email });
      
      if (exists) {
        console.log(`⏭️  User ${user.email} already exists, skipping...`);
      } else {
        await usersCollection.insertOne(user);
        console.log(`✅ Created user: ${user.email} (${user.role})`);
      }
    }
    
    console.log('\n🎉 Seeding complete!');
    console.log('\n📝 Test Credentials:');
    console.log('   Super Admin: admin@xdoxs.com / ramram');
    console.log('   Instructor:  instructor@xdoxs.com / ramram');
    console.log('   Student:     student@xdoxs.com / ramram');
    
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    await client.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

seedUsers();
