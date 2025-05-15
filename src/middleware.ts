import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware handles .txt files requested by RSC by redirecting them to our API routes
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // Map .txt files to API routes
  if (url.pathname.endsWith('houseplants.txt')) {
    url.pathname = '/api/houseplants';
    return NextResponse.rewrite(url);
  }
  
  if (url.pathname.endsWith('garden-plants.txt')) {
    url.pathname = '/api/garden-plants';
    return NextResponse.rewrite(url);
  }
  
  if (url.pathname.endsWith('hydro-aquatic.txt')) {
    url.pathname = '/api/hydro-aquatic';
    return NextResponse.rewrite(url);
  }
  
  // Handle any other .txt files
  if (url.pathname.endsWith('.txt')) {
    // Return empty content with 200 status for other txt files
    return new NextResponse('', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths ending with .txt
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*\\.txt)',
    // Match specific problematic paths
    '/houseplants.txt',
    '/garden-plants.txt',
    '/hydro-aquatic.txt'
  ],
}; 