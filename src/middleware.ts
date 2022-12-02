// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    // const acivitypubContentType = 'application/activity+json';

    // const pathSplit = request.nextUrl.pathname.substring(1).split('/');
    // const pathJoin = (splitPath: string[]) => {
    //     return '/'+splitPath.join('/')+request.nextUrl.search;
    // }
    // console.log(request.nextUrl)
    // if (pathSplit[0] === '.well-known') {
    //     return NextResponse.rewrite(new URL(`/api/parent${pathJoin(pathSplit)}`, request.url));
    // }
    // if (pathSplit[0] === 'users') {
    //     if (request.headers.get("accept")?.includes(acivitypubContentType)) {
    //         return NextResponse.rewrite(new URL(`/api/parent${pathJoin(pathSplit)}`, request.url));
    //     }
    //     else {

    //     }
    // }
    // return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
//   matcher: ['/.well-known/:path*', '/users/:path*'],
}
