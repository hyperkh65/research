/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Docker 환경 최적화
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
