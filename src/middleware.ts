// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname+'/';
    if (path.startsWith('/.well-known/')) {
        return NextResponse.rewrite(new URL(`/api${request.nextUrl.pathname}`, request.url))
    }
    if (path.startsWith('/users/')) {
        return NextResponse.rewrite(new URL(`/api${request.nextUrl.pathname}`, request.url))
    }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/.well-known/:path*', '/users/:user*'],
}
