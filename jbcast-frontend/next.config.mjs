// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // add other valid Next.js options here (redirects, rewrites, headers, images, etc.)

  
  // Allow additional origins in development (for /_next/*, HMR, etc.)
  // Add any others you use, e.g. LAN IPs or custom local domains.
  allowedDevOrigins: ['127.0.0.1'],
}

export default nextConfig
