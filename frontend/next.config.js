/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Handle @react-native-async-storage/async-storage
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
      'fs': false,
      'path': false,
      'os': false,
    };

    config.resolve.alias = {
      ...config.resolve.alias,
      'encoding': false,
    };

    return config;
  },
};

module.exports = nextConfig;
