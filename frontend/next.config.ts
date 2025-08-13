/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["*.preview.same-app.com"],
  
  // Security headers to prevent MIME type issues and external script conflicts
  async headers() {
    // Get backend URL from environment variable
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const backendHost = new URL(backendUrl).hostname;
    const backendPort = new URL(backendUrl).port;
    
    // Build CSP with dynamic backend URL
    const cspValue = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
      "style-src 'self' 'unsafe-inline' https:",
      `img-src 'self' data: https: ${backendUrl} https://${backendHost}${backendPort ? ':' + backendPort : ''}`,
      "font-src 'self' https:",
      `connect-src 'self' https: ${backendUrl} https://${backendHost}${backendPort ? ':' + backendPort : ''}`,
      "frame-src 'none'",
      "object-src 'none'"
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: cspValue,
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    optimizeCss: true,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Fallback domains for older Next.js versions
    domains: ['localhost', 'flashnewslk.com', 'www.flashnewslk.com', 'thedailyherald.onrender.com'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'flashnewslk.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.flashnewslk.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'thedailyherald.onrender.com',
        pathname: '/**',
      },
    ],
  },
  
  // Compression and optimization
  compress: true,
  poweredByHeader: false,
  
  // Source maps for better debugging
  productionBrowserSourceMaps: true,
  
  // Reduce Fast Refresh messages in development
  ...(process.env.NODE_ENV === 'development' && {
    // @ts-expect-error - webpack config type is complex and varies by Next.js version
    webpack: (config, { dev, isServer }) => {
      if (dev && !isServer) {
        // Reduce console output during development
        config.infrastructureLogging = {
          level: 'error',
        };
        // Suppress Fast Refresh messages
        config.stats = 'errors-only';
      }
      
      // Optimize bundle size
      if (!isServer) {
        config.optimization = {
          ...config.optimization,
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
                priority: 10,
              },
              common: {
                name: 'common',
                minChunks: 2,
                chunks: 'all',
                enforce: true,
                priority: 5,
              },
              // Separate React and Next.js chunks
              react: {
                test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                name: 'react',
                chunks: 'all',
                priority: 20,
              },
              // Separate UI library chunks
              ui: {
                test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
                name: 'ui',
                chunks: 'all',
                priority: 15,
              },
            },
          },
          // Enable tree shaking
          usedExports: true,
          sideEffects: false,
        };
      }
      
      // Optimize images
      config.module.rules.push({
        test: /\.(png|jpe?g|gif|svg|webp|avif)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              fallback: 'file-loader',
              publicPath: '/_next/static/images/',
              outputPath: 'static/images/',
            },
          },
        ],
      });
      
      return config;
    },
  }),
  
  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    // @ts-expect-error - webpack config type is complex and varies by Next.js version
    webpack: (config, { isServer }) => {
      if (!isServer) {
        // Enable aggressive code splitting
        config.optimization = {
          ...config.optimization,
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
                priority: 10,
                enforce: true,
              },
              common: {
                name: 'common',
                minChunks: 2,
                chunks: 'all',
                enforce: true,
                priority: 5,
              },
              // Separate critical chunks
              critical: {
                test: /[\\/]src[\\/]components[\\/](Header|Footer|ArticleContent)[\\/]/,
                name: 'critical',
                chunks: 'all',
                priority: 30,
                enforce: true,
              },
            },
          },
          // Enable tree shaking
          usedExports: true,
          sideEffects: false,
          // Minimize bundle size
          minimize: true,
        };
      }
      
      return config;
    },
  }),
};

export default nextConfig;
