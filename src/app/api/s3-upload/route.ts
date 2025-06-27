import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { createId } from '@paralleldrive/cuid2';
import { NextResponse } from 'next/server';

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST() {
  const id = createId();
  const key = `potholes/${id}.jpg`;

  try {
    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
      Conditions: [
        ['content-length-range', 0, 10485760], // up to 10 MB
        ['eq', '$Content-Type', 'image/jpeg'],
      ],
      Fields: {
        'Content-Type': 'image/jpeg',
      },
      Expires: 600, // 10 minutes
    });

    const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;

    return NextResponse.json({ success: true, url, fields, publicUrl });
  } catch (error) {
    console.error('Error creating presigned post:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating presigned URL.' },
      { status: 500 }
    );
  }
}
