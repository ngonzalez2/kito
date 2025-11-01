import type { MetadataRoute } from 'next';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://kito.market').replace(/\/$/, '');

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['/', '/listings', '/sell'];
  const lastModified = new Date();
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
  }));
}
