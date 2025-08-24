// middleware.ts (or middleware.js)
import { NextResponse } from 'next/server'
// If you're using JS, you can remove the type import and the comment annotation below.
// import type { NextRequest } from 'next/server'

export const config = {
  // Only run on these routes
  matcher: ['/dashboard/:path*', '/files/:path*'],
}

export function middleware(request /*: NextRequest */) {
  const token = request.cookies.get('token')?.value

  if (!token) {
    // Redirects in Middleware must use absolute URLs
    const loginUrl = new URL('/login', request.url)
    // Preserve the intended destination (include query if present)
    const next = request.nextUrl.pathname + (request.nextUrl.search || '')
    loginUrl.searchParams.set('next', next)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}
