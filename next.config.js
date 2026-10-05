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
        destination: '/es/codigos-de-canje-de-fc-mobile',
        permanent: true,
      }
    ];
  }
};

module.exports = nextConfig;
