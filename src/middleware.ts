// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    const acivitypubContentType = 'application/activity+json';
    const path = request.nextUrl.pathname+'/'+request.nextUrl.search;
    if (path.startsWith('/.well-known/')) {
        return NextResponse.rewrite(new URL(`/api/parent${path}`, request.url));
    }
    if (request.headers.get("accept")?.includes(acivitypubContentType)) {
        if (path.startsWith('/users/')) {
            return NextResponse.rewrite(new URL(`/api/parent${path}`, request.url));
        }
    }
    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/.well-known/:path*', '/users/:user*'],
}
