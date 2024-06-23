/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination:
        process.env.NODE_ENV === 'development'
            ? 'http://localhost:5000/api/:path*'
            : '/api/',
      },
    ]
  },
  experimental: {
    proxyTimeout: 1000 * 120,
  }
}

export default nextConfig;
