import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Feedback from '@/models/Feedback';
import { ApiResponse } from '@/types';

// GET approved feedbacks (Public - No Auth Required)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const feedbacks = await Feedback.find({
      status: 'approved',
      isActive: true
    })
      .select('name feedback createdAt')
      .sort({ approvedAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Feedbacks retrieved successfully',
      data: { feedbacks }
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });

  } catch (error) {
    console.error('Get public feedbacks error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}