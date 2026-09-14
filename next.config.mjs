/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "blockchains.tatum.io",
      },
    ],
  },
};

export default nextConfig;
