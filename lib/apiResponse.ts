import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

export function successResponse<T>(data: T, message: string = 'Success', status: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    message,
    data
  }, { status });
}

export function errorResponse(message: string, status: number = 400, errors?: any[]): NextResponse<ApiResponse> {
  return NextResponse.json({
    success: false,
    message,
    errors
  }, { status });
}

export function validationErrorResponse(errors: any[]): NextResponse<ApiResponse> {
  return NextResponse.json({
    success: false,
    message: 'Validation failed',
    errors
  }, { status: 400 });
}

export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse<ApiResponse> {
  return NextResponse.json({
    success: false,
    message
  }, { status: 401 });
}

export function forbiddenResponse(message: string = 'Forbidden'): NextResponse<ApiResponse> {
  return NextResponse.json({
    success: false,
    message
  }, { status: 403 });
}

export function notFoundResponse(message: string = 'Not found'): NextResponse<ApiResponse> {
  return NextResponse.json({
    success: false,
    message
  }, { status: 404 });
}

export function serverErrorResponse(message: string = 'Internal server error'): NextResponse<ApiResponse> {
  return NextResponse.json({
    success: false,
    message
  }, { status: 500 });
}