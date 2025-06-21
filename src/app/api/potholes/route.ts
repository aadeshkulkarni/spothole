import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Pothole from '@/models/Pothole';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  await dbConnect();

  try {
    const potholes = await Pothole.find({})
      .populate({
        path: 'reportedBy',
        model: User,
        select: 'name',
      })
      .sort({ createdAt: -1 });
    return NextResponse.json(
      { success: true, data: potholes },
      { status: 200 }
    );
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
    const { longitude, latitude, imageUrl, description } = body;

    // Basic validation
    if (!longitude || !latitude || !imageUrl) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const user = await User.findOne({ email: session?.user?.email });

    const potholeData = {
      imageUrl,
      description,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      reportedBy: user?._id,
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
