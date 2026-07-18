/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  transpilePackages: ["pdfjs-dist"],
};

module.exports = nextConfig;
