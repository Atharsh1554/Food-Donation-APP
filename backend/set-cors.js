const { S3Client, PutBucketCorsCommand } = require('@aws-sdk/client-s3');

const client = new S3Client({ region: 'ap-south-1' });
const BUCKET_NAME = 'foodshare-donations-mystrio-mumbai';

async function setCors() {
  const command = new PutBucketCorsCommand({
    Bucket: BUCKET_NAME,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['PUT', 'POST', 'GET'],
          AllowedOrigins: ['*'],
          ExposeHeaders: []
        }
      ]
    }
  });

  try {
    await client.send(command);
    console.log('✅ CORS configuration successfully applied to bucket: ' + BUCKET_NAME);
  } catch (err) {
    console.error('❌ Error setting CORS configuration:', err);
  }
}

setCors();
