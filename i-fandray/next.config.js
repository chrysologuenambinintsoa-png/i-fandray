/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sécurité - Headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Images - Configuration sécurisée
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    // Désactiver les images externes non sécurisées en production
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Experimental - Fonctionnalités de sécurité
  experimental: {
    // Server Components pour une meilleure sécurité
    serverComponentsExternalPackages: [],
  },

  // Build - Optimisations de sécurité
  swcMinify: true,

  // Webpack - Configuration de sécurité
  webpack: (config, { dev, isServer }) => {
    // Désactiver les source maps en production
    if (!dev && !isServer) {
      config.devtool = false;
    }

    // Externals pour WebSocket
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });

    // Optimisations de sécurité
    if (!dev) {
      config.optimization.minimize = true;
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }

    return config;
  },

  // TypeScript - Configuration stricte
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint - Configuration stricte
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;