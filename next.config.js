/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  staticPageGenerationTimeout: 600,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['ssh2', 'ssh2-sftp-client', 'cpu-features'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  },
  async redirects() {
    return [
      // Simple path redirects (no query param logic here to avoid loops)
      {
        source: '/squad-builder',
        destination: '/tools/squad-builder',
        permanent: true,
      },
      {
        source: '/compare',
        destination: '/tools/player-compare',
        permanent: true,
      },
      {
        source: '/watchlist',
        destination: '/tools/watchlist',
        permanent: true,
      },
      // Redirect main /blogs/redeem-codes hub to global, but NOT individual regional blogs
      {
        source: '/blogs/redeem-codes',
        destination: '/fc-mobile-redeem-codes',
        permanent: true,
      },
      // Regional redeem code short alias redirects (R2 Homepage Authority Funnel)
      {
        source: '/th',
        destination: '/th/fc-mobile-code',
        permanent: true,
      },
      {
        source: '/ae',
        destination: '/ae/kod-fifa',
        permanent: true,
      },
      {
        source: '/es',
        destination: '/es/codigos-fc-mobile',
        permanent: true,
      }
    ];
  }
};

module.exports = nextConfig;
