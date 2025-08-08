import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Manual sitemap refresh triggered');
    
    // Force Next.js to regenerate the sitemap
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    // Trigger sitemap regeneration by accessing it
    const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (sitemapResponse.ok) {
      console.log('✅ Sitemap refreshed successfully');
      return NextResponse.json({
        success: true,
        message: 'Sitemap refreshed successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('❌ Failed to refresh sitemap:', sitemapResponse.status);
      return NextResponse.json({
        success: false,
        error: 'Failed to refresh sitemap',
        status: sitemapResponse.status
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Error refreshing sitemap:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Getting sitemap status');
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    // Check sitemap accessibility
    const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    if (sitemapResponse.ok) {
      const sitemapText = await sitemapResponse.text();
      const articleCount = (sitemapText.match(/\/article\//g) || []).length;
      
      return NextResponse.json({
        success: true,
        accessible: true,
        articleCount,
        lastModified: new Date().toISOString(),
        size: sitemapText.length
      });
    } else {
      return NextResponse.json({
        success: false,
        accessible: false,
        status: sitemapResponse.status
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking sitemap status:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
