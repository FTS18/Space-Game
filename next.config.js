/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/games/space-fire/index',
        destination: '/games/space-fire/index.html',
      },
      {
        source: '/games/pacman/index',
        destination: '/games/pacman/index.html',
      },
      {
        source: '/games/ping-pong/index',
        destination: '/games/ping-pong/index.html',
      }
    ];
  }
};

module.exports = nextConfig;
