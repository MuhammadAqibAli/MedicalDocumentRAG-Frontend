/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
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
  swcMinify: true,
  poweredByHeader: false
}

export default nextConfig
