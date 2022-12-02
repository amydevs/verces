// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    // const acivitypubContentType = 'application/activity+json';

    // const pathSplit = request.nextUrl.pathname.substring(1).split('/');
    // const path = request.nextUrl.pathname+'/'+request.nextUrl.search;

    // console.log(request.nextUrl)
    // if (pathSplit[0] === '.well-known') {
    //     return NextResponse.rewrite(new URL(`/api/parent${path}`, request.url));
    // }
    // if (pathSplit[0] === 'users') {
    //     if (request.headers.get("accept")?.includes(acivitypubContentType)) {
    //         return NextResponse.rewrite(new URL(`/api/parent${path}`, request.url));
    //     }
    //     else if (pathSplit[2] === "statuses") {
    //         return NextResponse.redirect(new URL(`/@/${pathSplit[1]}/${pathSplit[3]}`, request.url));
    //     }
    //     else {
    //         return NextResponse.redirect(new URL(`/@/${pathSplit[1]}`, request.url));
    //     }
    // }
    // return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
//   matcher: ['/.well-known/:path*', '/users/:path*'],
}
