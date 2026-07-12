const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const path = require('path');
const fs = require('fs');

const USE_AWS = process.env.USE_AWS === 'true';
const REGION = process.env.AWS_REGION || 'ap-south-1';
const BUCKET_NAME = process.env.S3_BUCKET_NAME || process.env.S3_BUCKET || 'foodshare-donations-mystrio-mumbai';

let s3Client = null;

if (USE_AWS) {
  try {
    s3Client = new S3Client({ region: REGION });
    console.log('AWS S3 Client Initialized');
  } catch (error) {
    console.error('Failed to initialize AWS S3 Client:', error);
  }
}

// Local mock storage paths
const LOCAL_UPLOADS_DIR = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
  fs.mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true });
}

const getPresignedUploadUrl = async (fileName, fileType) => {
  const key = `${Date.now()}-${fileName}`;
  
  if (USE_AWS && s3Client) {
    try {
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: fileType,
      });
      // URL expires in 5 minutes (300 seconds)
      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
      const imageUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
      return { uploadUrl, imageUrl, key, mode: 'aws' };
    } catch (error) {
      console.error('Error generating presigned S3 URL:', error);
      throw error;
    }
  } else {
    // Local fallback: return a mock upload URL that points to our backend's upload route
    const mockUploadUrl = `/api/upload-local`;
    const imageUrl = `/uploads/${key}`;
    return { uploadUrl: mockUploadUrl, imageUrl, key, mode: 'local' };
  }
};

module.exports = {
  getPresignedUploadUrl,
  LOCAL_UPLOADS_DIR
};
