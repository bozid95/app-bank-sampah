import type { APIRoute } from 'astro';
import { getAppConfig } from '../lib/config';

export const GET: APIRoute = async () => {
  const config = await getAppConfig();
  const manifest = {
    name: config.appName,
    short_name: config.appName.slice(0, 12),
    description: `Buku tabungan ${config.organizationName}`,
    lang: 'id',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f2f5f3',
    theme_color: config.primaryColor,
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: { 'Content-Type': 'application/manifest+json', 'Cache-Control': 'public, max-age=300' },
  });
};
