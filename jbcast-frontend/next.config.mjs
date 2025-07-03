/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Optional: only needed if you want to limit middleware to specific routes
  matcher: ['/dashboard/:path*', '/files/:path*'],
}

export default nextConfig
