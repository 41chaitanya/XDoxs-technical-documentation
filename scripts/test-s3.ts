import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';

// Load .env manually
const envContent = readFileSync('.env', 'utf-8');
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const val = match[2].trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

async function test() {
  const region = process.env.AWS_REGION || 'ap-south-2';
  const bucket = process.env.S3_DOCS_BUCKET || 'xdoxs-docs-content';
  const accessKey = process.env.AWS_ACCESS_KEY_ID || '';
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY || '';

  console.log(`Region: ${region}`);
  console.log(`Bucket: ${bucket}`);
  console.log(`Access Key: ${accessKey ? accessKey.slice(0, 5) + '...' : 'NOT SET'}`);
  console.log(`Secret Key: ${secretKey ? '***set***' : 'NOT SET'}\n`);

  const s3 = new S3Client({
    region,
    ...(accessKey && secretKey
      ? { credentials: { accessKeyId: accessKey, secretAccessKey: secretKey } }
      : {}),
  });

  try {
    const list = await s3.send(new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: 'docs/',
      MaxKeys: 20,
    }));
    console.log(`S3 objects found: ${list.KeyCount}\n`);
    for (const obj of list.Contents || []) {
      console.log(`  ${obj.Key}  (${obj.Size} bytes, ${obj.LastModified?.toISOString()})`);
    }

    // Try to read the first .md file
    const mdFile = (list.Contents || []).find(o => o.Key?.endsWith('.md'));
    if (mdFile) {
      console.log(`\n--- Reading ${mdFile.Key} ---`);
      const resp = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: mdFile.Key }));
      const body = await resp.Body?.transformToString('utf-8');
      console.log(`Content length: ${body?.length || 0} chars`);
      console.log(`First 200 chars:\n${body?.slice(0, 200)}`);
    }
  } catch (err: any) {
    console.error(`ERROR: ${err.name}: ${err.message}`);
  }
}

test();
