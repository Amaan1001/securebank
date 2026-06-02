/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.GATEWAY_URL || 'http://localhost:8080'}/api/v1/:path*`,
      },
      {
        source: '/api/auth/:path*',
        destination: `${process.env.GATEWAY_URL || 'http://localhost:8080'}/auth/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
