/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "pub.adpilotindia.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // DALL-E 3 generated images (Azure Blob Storage via OpenAI)
      { protocol: "https", hostname: "oaidalleapiprodscus.blob.core.windows.net" },
      { protocol: "https", hostname: "dalleprodsec.blob.core.windows.net" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.API_URL || "http://localhost:4000"}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
