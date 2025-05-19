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
  // Skip type checking during build
  experimental: {
    serverComponentsExternalPackages: [
      '@ckeditor/ckeditor5-build-classic',
      '@ckeditor/ckeditor5-react',
      'html2pdf.js',
      'html2canvas',
      'jspdf'
    ]
  },
  // Disable static optimization for pages that use CKEditor
  // This ensures they're always server-rendered during build
  reactStrictMode: true,
  swcMinify: true
}

export default nextConfig