import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@whiskeysockets/baileys', 'sql.js', 'jimp', 'sharp'],
  allowedDevOrigins: ['192.168.20.26', 'localhost', '127.0.0.1', '*.loca.lt', 'eleven-bikes-care.loca.lt'],
};

export default nextConfig;
