import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createId } from '@paralleldrive/cuid2';
import { NextRequest, NextResponse } from 'next/server';

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { fileType } = await req.json();

    if (!fileType) {
      return NextResponse.json(
        { success: false, message: 'File type is required.' },
        { status: 400 }
      );
    }

    const id = createId();
    const ex = fileType.split('/')[1];
    const key = `${id}.${ex}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
      ContentType: fileType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 60, // URL expires in 60 seconds
    });

    return NextResponse.json({ success: true, url: presignedUrl, key: key });
  } catch (error) {
    console.error('Error creating presigned URL:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating presigned URL.' },
      { status: 500 }
    );
  }
}
