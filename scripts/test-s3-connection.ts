/**
 * Test S3 Connection
 * Tests if AWS credentials are working and S3 bucket is accessible
 */

import { S3Client, ListObjectsV2Command, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const REGION = process.env.AWS_REGION || 'ap-south-2';
const BUCKET = process.env.S3_DOCS_BUCKET || 'xdoxs-docs-656829';
const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID || '';
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';

async function testS3Connection() {
  console.log('🧪 Testing S3 Connection...\n');
  
  // Check if credentials are set
  if (!ACCESS_KEY || !SECRET_KEY) {
    console.error('❌ AWS credentials not found in .env file');
    console.log('Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
    process.exit(1);
  }
  
  console.log('✅ AWS Credentials found');
  console.log(`📦 Bucket: ${BUCKET}`);
  console.log(`🌍 Region: ${REGION}\n`);
  
  // Create S3 client
  const client = new S3Client({
    region: REGION,
    credentials: {
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET_KEY,
    },
  });
  
  try {
    // Test 1: List objects in bucket
    console.log('Test 1: Listing objects in bucket...');
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET,
      MaxKeys: 5,
    });
    const listResult = await client.send(listCommand);
    console.log(`✅ Successfully connected! Found ${listResult.KeyCount || 0} objects`);
    
    if (listResult.Contents && listResult.Contents.length > 0) {
      console.log('   Sample files:');
      listResult.Contents.slice(0, 3).forEach(obj => {
        console.log(`   - ${obj.Key}`);
      });
    }
    
    // Test 2: Upload a test file
    console.log('\nTest 2: Uploading test file...');
    const testKey = 'test/connection-test.txt';
    const testContent = `S3 Connection Test - ${new Date().toISOString()}`;
    
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
    });
    await client.send(putCommand);
    console.log(`✅ Successfully uploaded: ${testKey}`);
    
    // Test 3: Read the test file back
    console.log('\nTest 3: Reading test file...');
    const getCommand = new GetObjectCommand({
      Bucket: BUCKET,
      Key: testKey,
    });
    const getResult = await client.send(getCommand);
    const downloadedContent = await getResult.Body?.transformToString('utf-8');
    console.log(`✅ Successfully downloaded: ${downloadedContent}`);
    
    console.log('\n🎉 All S3 tests passed! Your AWS configuration is working correctly.');
    
  } catch (error: any) {
    console.error('\n❌ S3 Test Failed:');
    console.error(`Error: ${error.message}`);
    
    if (error.name === 'NoSuchBucket') {
      console.error(`\nThe bucket "${BUCKET}" does not exist or you don't have access to it.`);
    } else if (error.name === 'InvalidAccessKeyId') {
      console.error('\nYour AWS Access Key ID is invalid.');
    } else if (error.name === 'SignatureDoesNotMatch') {
      console.error('\nYour AWS Secret Access Key is invalid.');
    } else if (error.name === 'AccessDenied') {
      console.error('\nAccess denied. Check your IAM permissions.');
    }
    
    process.exit(1);
  }
}

testS3Connection();
