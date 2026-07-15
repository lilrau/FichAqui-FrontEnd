/** @type {import('next').NextConfig} */
const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8001';

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${backendUrl}/api/:path*` },
      { source: '/sanctum/:path*', destination: `${backendUrl}/sanctum/:path*` },
    ];
  },
};

export default nextConfig;
