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
  async redirects() {
    return [
      // Simple path redirects (no query param logic here to avoid loops)
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
      // Active regional blog posts
      {
        source: '/blogs/redeem-codes/codigos-de-canje-de-fc-mobile-spanish',
        destination: '/es/codigos-de-canje-de-fc-mobile',
        permanent: true,
      },
      {
        source: '/blogs/redeem-codes/kod-fifa-arabic',
        destination: '/ae/kod-fifa',
        permanent: true,
      },
      {
        source: '/blogs/redeem-codes/fc-mobile-code-thai',
        destination: '/th/fc-mobile-code',
        permanent: true,
      },
      {
        source: '/blogs/redeem-codes',
        destination: '/fc-mobile-redeem-codes',
        permanent: true,
      }
    ];
  }
};

module.exports = nextConfig;
