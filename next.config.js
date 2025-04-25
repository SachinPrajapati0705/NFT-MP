/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["gateway.pinata.cloud"],
    formats: ["image/webp"],
  },
  webpack: (config) => {
    // Disable node-specific modules in client-side
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;

    // Configure file loader for PDFs
    config.module.rules.push({
      test: /\.pdf$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            publicPath: '/_next/static/files/',
            outputPath: 'static/files/'
          }
        }
      ]
    });

    return config;
  }
};

module.exports = nextConfig;
