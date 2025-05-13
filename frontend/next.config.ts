import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    'local-origin.dev', 
    '*.local-origin.dev', 
    'http://192.168.1.122',
    '192.168.1.122',
    'http://localhost',
  ],
};

export default nextConfig;
