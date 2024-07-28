import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
export { default } from "next-auth/middleware";
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });
    const url = request.nextUrl;

    // If the user is authenticated, prevent them from accessing the auth pages
    if (token && (
        url.pathname === '/sign-in' ||
        url.pathname === '/sign-up' ||
        url.pathname === '/verify'
    )) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If the user is not authenticated, redirect them to the sign-in page when accessing protected routes
    if (!token && url.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }
}

// Ensure matcher paths are correct
export const config = {
    matcher: [
        '/sign-in',
        '/sign-up',
        '/',
        '/dashboard/:path*',
        '/verify/:path*',
    ],
};
