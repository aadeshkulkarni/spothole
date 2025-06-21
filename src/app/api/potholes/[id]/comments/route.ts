import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Pothole from '@/models/Pothole';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

type Params = Promise<{ id: string }>;

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { id } = await params;
    const pothole = await Pothole.findById(id);
    if (!pothole) {
      return NextResponse.json(
        { message: 'Pothole not found' },
        { status: 404 }
      );
    }

    const { text } = await req.json();
    if (!text) {
      return NextResponse.json(
        { message: 'Comment text is required' },
        { status: 400 }
      );
    }

    const newCommentData = {
      text,
      user: session.user.id,
    };

    // Ensure comments array exists for older documents
    if (!pothole.comments) {
      pothole.comments = [];
    }

    pothole.comments.push(newCommentData);
    await pothole.save();

    // The new comment is the last one in the array after saving
    const savedComment = pothole.comments[pothole.comments.length - 1];

    const populatedComment = {
      _id: savedComment._id,
      text: savedComment.text,
      createdAt: savedComment.createdAt,
      user: {
        _id: session.user.id,
        name: session.user.name,
        image: session.user.image,
      },
    };

    return NextResponse.json(
      { success: true, data: populatedComment },
      { status: 201 }
    );
  } catch (error) {
    console.log('Error in POST /api/potholes/[id]/comments:', error);
    return NextResponse.json(
      { success: false, message: 'Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request, { params }: { params: Params }) {
  const { id } = await params;
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '5', 10);
    const skip = (page - 1) * limit;

    const pothole = await Pothole.findById(id).populate({
      path: 'comments',
      populate: {
        path: 'user',
        model: User,
        select: 'name image',
      },
    });

    if (!pothole) {
      return NextResponse.json(
        { message: 'Pothole not found' },
        { status: 404 }
      );
    }

    // Ensure comments array exists for older documents
    if (!pothole.comments) {
      pothole.comments = [];
    }

    const comments = [...pothole.comments].reverse().slice(skip, skip + limit);

    return NextResponse.json(
      {
        success: true,
        data: comments,
        hasMore: pothole.comments.length > skip + limit,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log('Error in GET /api/potholes/[id]/comments:', error);
    return NextResponse.json(
      { success: false, message: 'Server Error' },
      { status: 500 }
    );
  }
}
