import dbConnect from '@/lib/dbConnect';
import Pothole from '@/models/Pothole';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  await dbConnect();

  try {
    const potholesFromDb = await Pothole.find({}).sort({ createdAt: -1 });
    const potholes = potholesFromDb.map((p) => ({
      id: p._id.toString(),
      latitude: p.location.coordinates[1],
      longitude: p.location.coordinates[0],
      createdAt: p.createdAt,
      imageUrl: p.imageUrl,
      description: p.description,
      status: p.status,
    }));
    return NextResponse.json(potholes);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: 'Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const { longitude, latitude, imageUrl, description, severity } = body;

    // Basic validation
    if (!longitude || !latitude || !imageUrl || !severity) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const potholeData = {
      imageUrl,
      description,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      severity,
    };

    const pothole = await Pothole.create(potholeData);

    return NextResponse.json({ success: true, data: pothole }, { status: 201 });
  } catch (error) {
    console.log(error);
    // A more specific error could be returned based on the error type
    return NextResponse.json(
      { success: false, message: 'Server Error' },
      { status: 500 }
    );
  }
}
