import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Feedback from '@/models/Feedback';
import { verifyToken, hasPermission } from '@/lib/auth';
import { ApiResponse, CreateFeedbackRequest } from '@/types';

// GET all feedbacks (Admin only)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const token = request.cookies.get('authToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    if (!hasPermission(decoded.role, 'feedbacks:read')) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Insufficient permissions'
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query: any = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }

    const feedbacks = await Feedback.find(query)
      .populate('approvedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Feedbacks retrieved successfully',
      data: { feedbacks }
    });

  } catch (error) {
    console.error('Get feedbacks error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

// POST - Create new feedback (Public)
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body: CreateFeedbackRequest = await request.json();

    // Validation
    const errors: any[] = [];

    if (!body.name?.trim()) {
      errors.push({ field: 'name', message: 'Name is required' });
    } else if (body.name.length > 100) {
      errors.push({ field: 'name', message: 'Name cannot exceed 100 characters' });
    }

    if (!body.mobile?.trim()) {
      errors.push({ field: 'mobile', message: 'Mobile number is required' });
    } else if (!/^[0-9]{10,15}$/.test(body.mobile.replace(/[\s-]/g, ''))) {
      errors.push({ field: 'mobile', message: 'Please enter a valid mobile number' });
    }

    if (!body.feedback?.trim()) {
      errors.push({ field: 'feedback', message: 'Feedback is required' });
    } else if (body.feedback.trim().length < 10) {
      errors.push({ field: 'feedback', message: 'Feedback must be at least 10 characters' });
    } else if (body.feedback.length > 1000) {
      errors.push({ field: 'feedback', message: 'Feedback cannot exceed 1000 characters' });
    }

    if (errors.length > 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Validation failed',
        errors
      }, { status: 400 });
    }

    // Create new feedback
    const newFeedback = new Feedback({
      name: body.name.trim(),
      mobile: body.mobile.replace(/[\s-]/g, ''),
      feedback: body.feedback.trim(),
      status: 'pending'
    });

    await newFeedback.save();

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Thank you for your feedback! It will be reviewed shortly.',
      data: { feedback: newFeedback }
    }, { status: 201 });

  } catch (error) {
    console.error('Create feedback error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}