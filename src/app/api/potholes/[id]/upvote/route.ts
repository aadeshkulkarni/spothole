import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Pothole from '@/models/Pothole';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

type Params = Promise<{ id: string }>;

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
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

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const userId = user._id;

    // Ensure upvotes array exists for older documents
    if (!pothole.upvotes) {
      pothole.upvotes = [];
    }

    const upvotedIndex = pothole.upvotes.findIndex(
      (upvotedUserId: any) => upvotedUserId.toString() === userId.toString()
    );

    if (upvotedIndex > -1) {
      // User has already upvoted, so remove the upvote
      pothole.upvotes.splice(upvotedIndex, 1);
    } else {
      // User has not upvoted, so add the upvote
      pothole.upvotes.push(userId);
    }

    await pothole.save();

    return NextResponse.json(
      {
        success: true,
        data: {
          upvotes: pothole.upvotes,
          upvoteCount: pothole.upvotes.length,
        },
      },
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
