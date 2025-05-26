/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add this to generate a consistent build ID
  generateBuildId: async () => {
    // You can use a timestamp or any other unique identifier
    return 'medical-assistant-build-' + Date.now()
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable source maps in production to reduce memory usage
  productionBrowserSourceMaps: false,
  images: {
    unoptimized: true,
  },
  output: 'standalone', // Optimizes for production deployment
  // Exclude browser-only libraries from server-side rendering
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't attempt to import browser-only libraries on the server
      config.externals = [
        ...(config.externals || []),
        {
          '@ckeditor/ckeditor5-build-classic': 'commonjs @ckeditor/ckeditor5-build-classic',
          '@ckeditor/ckeditor5-react': 'commonjs @ckeditor/ckeditor5-react',
          'html2pdf.js': 'commonjs html2pdf.js',
          'html2canvas': 'commonjs html2canvas',
          'jspdf': 'commonjs jspdf'
        }
      ];
    }

    // Add a fallback for the missing module
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'next/dist/server/route-modules/app-page/vendored/contexts/loadable': false
    };

    return config;
  },
  // Updated for Next.js 15
  serverExternalPackages: [
    '@ckeditor/ckeditor5-build-classic',
    '@ckeditor/ckeditor5-react',
    'html2pdf.js',
    'html2canvas',
    'jspdf'
  ],
  reactStrictMode: true,
  poweredByHeader: false
}

export default nextConfig
