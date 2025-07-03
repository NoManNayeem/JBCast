import { NextResponse } from 'next/server'

export const config = {
  matcher: ['/dashboard/:path*', '/files/:path*'],
}

export function middleware(request) {
  const token = request.cookies.get('token')?.value

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}
