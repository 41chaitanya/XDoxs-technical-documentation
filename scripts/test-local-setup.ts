/**
 * Local Testing Setup Script
 * 
 * This script sets up test data in MongoDB for local development
 * Run this when you don't have AWS credentials and want to test locally
 * 
 * Usage: npm run test-setup
 */

import { getDb } from '../src/lib/db/mongodb';
import { COLLECTIONS } from '../src/lib/db/models';
import { hashPassword } from '../src/lib/auth/password';

async function setupTestData() {
  console.log('🔧 Setting up local test data...\n');

  try {
    const db = await getDb();

    // 1. Create test users with 4 roles
    console.log('👤 Creating test users...');
    const usersCollection = db.collection(COLLECTIONS.USERS);
    
    const users = [
      { email: 'superadmin@test.com', role: 'super_admin', name: 'Super Admin' },
      { email: 'admin@test.com', role: 'admin', name: 'Admin User' },
      { email: 'instructor@test.com', role: 'instructor', name: 'Instructor User' },
      { email: 'student@test.com', role: 'student', name: 'Student User' },
    ];

    for (const user of users) {
      const existing = await usersCollection.findOne({ email: user.email });
      if (!existing) {
        await usersCollection.insertOne({
          email: user.email,
          passwordHash: await hashPassword('ramram'),
          fullName: user.name,
          role: user.role,
          createdAt: new Date(),
        });
        console.log(`   ✅ ${user.role} created: ${user.email} / ramram`);
      } else {
        console.log(`   ℹ️  ${user.role} already exists: ${user.email}`);
      }
    }

    console.log('\n✅ Test data setup complete!\n');
    console.log('📝 Login Credentials (all passwords: ramram):');
    console.log('   1. Super Admin: superadmin@test.com / ramram');
    console.log('   2. Admin: admin@test.com / ramram');
    console.log('   3. Instructor: instructor@test.com / ramram');
    console.log('   4. Student: student@test.com / ramram');
    console.log('\n🚀 Run: npm run test-mongo\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up test data:', error);
    process.exit(1);
  }
}

setupTestData();
