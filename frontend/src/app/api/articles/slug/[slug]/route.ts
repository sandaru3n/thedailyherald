import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Cache for 1 minute
export const revalidate = 60;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    
    // Add cache headers
    const response = await fetch(`${API_BASE_URL}/api/articles/slug/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Article not found' },
          { 
            status: 404,
            headers: {
              'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
            }
          }
        );
      }
      throw new Error('Failed to fetch article');
    }

    const data = await response.json();
    
    // Return with cache headers
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Article by slug GET API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch article' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      }
    );
  }
} 