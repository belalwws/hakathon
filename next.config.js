/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // Disable ESLint checks for deployment
  },
  typescript: {
    ignoreBuildErrors: true, // Disable TypeScript checks for deployment
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Canvas and nodemailer configuration for production
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('canvas')
      // Fix nodemailer issues in production
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      }
    }

    // Optimize webpack for faster builds (only in production)
    if (process.env.NODE_ENV === 'production') {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
      }
    }

    return config
  },
  // Optimize for production
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'framer-motion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
    ],
  },
  // Fix chunk loading issues
  output: 'standalone',
  // Ensure proper asset loading
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Enable compression
  compress: true,
  // Optimize page data
  generateBuildId: async () => {
    return process.env.BUILD_ID || 'build-' + Date.now()
  },
  // Add cache headers for static assets
  async headers() {
    return [
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
