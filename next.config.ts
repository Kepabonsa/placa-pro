// Author: Kevin Pabón
// external imports
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  // Dev only: lets a phone on the same Wi-Fi/LAN open the dev server by the PC's IP.
  allowedDevOrigins: ['192.168.*.*'],
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
}

export default nextConfig
