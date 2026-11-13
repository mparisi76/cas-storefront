import { MetadataRoute } from 'next';
import directus from '@/lib/directus';
import { readItems } from '@directus/sdk';
import { getActiveVendors } from '@/services/(public)/vendors';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://catskillas.com';

  // 1. Fetch all published inventory items
  const items = await directus.request(
    readItems('props', {
      filter: {
        status: { _eq: 'published' },
      },
      fields: ['id', 'date_updated'],
      limit: -1, // Fetch all items
    })
  );

  // 2. Map items to sitemap format
  const inventoryUrls = items.map((item) => ({
    url: `${baseUrl}/inventory/${item.id}`,
    lastModified: item.date_updated ? new Date(item.date_updated) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 3. Add your static pages (Home, Inventory, etc.)
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/inventory`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...["/about", "/contact", "/returns", "/terms", "/privacy"].map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: path === "/about" || path === "/contact" ? 0.6 : 0.3,
    })),
    ...(await getActiveVendors()).map((v) => ({
      url: `${baseUrl}/shop/${v.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...inventoryUrls,
  ];
}