import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';
    const status = searchParams.get('status') || '';
    const articleId = searchParams.get('articleId') || '';

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization header required' },
        { status: 401 }
      );
    }

    const params = new URLSearchParams({
      page,
      limit,
    });
    if (status) params.append('status', status);
    if (articleId) params.append('articleId', articleId);

    const response = await fetch(
      `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/comments/admin?${params}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch comments' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error fetching admin comments:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 