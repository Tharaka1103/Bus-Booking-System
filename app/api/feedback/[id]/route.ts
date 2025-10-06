import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Feedback from '@/models/Feedback';
import { verifyToken, hasPermission } from '@/lib/auth';
import { ApiResponse, UpdateFeedbackRequest } from '@/types';

// PUT - Update feedback (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    if (!hasPermission(decoded.role, 'feedbacks:write')) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Insufficient permissions'
      }, { status: 403 });
    }

    const body: UpdateFeedbackRequest = await request.json();
    const { id } = await params;

    const feedback = await Feedback.findById(id);
    
    if (!feedback) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Feedback not found'
      }, { status: 404 });
    }

    // Update fields
    if (body.status !== undefined) {
      feedback.status = body.status;
      if (body.status === 'approved') {
        feedback.approvedBy = decoded.userId;
        feedback.approvedAt = new Date();
      }
    }

    if (body.isActive !== undefined) {
      feedback.isActive = body.isActive;
    }

    await feedback.save();

    const updatedFeedback = await Feedback.findById(id)
      .populate('approvedBy', 'firstName lastName email');

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Feedback updated successfully',
      data: { feedback: updatedFeedback }
    });

  } catch (error) {
    console.error('Update feedback error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

// DELETE - Delete feedback (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    if (!hasPermission(decoded.role, 'feedbacks:delete')) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Insufficient permissions'
      }, { status: 403 });
    }

    const { id } = await params;

    const feedback = await Feedback.findByIdAndDelete(id);
    
    if (!feedback) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Feedback not found'
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Feedback deleted successfully'
    });

  } catch (error) {
    console.error('Delete feedback error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}