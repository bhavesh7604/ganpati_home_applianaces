import type { NextConfig } from 'next';

const supabaseHost = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').hostname; } catch { return null; }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost ? [{ protocol: 'https', hostname: supabaseHost }] : [],
  },
  experimental: { serverActions: { bodySizeLimit: '2mb' } },
};
export default nextConfig;
