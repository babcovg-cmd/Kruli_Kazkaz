// Динамический sitemap.xml — статические страницы + все активные туры.

import type { MetadataRoute } from "next";
import { getActiveTourSlugs } from "@/lib/data";
import { siteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getActiveTourSlugs();

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: siteUrl("/tours"), changeFrequency: "daily", priority: 0.9 },
    { url: siteUrl("/about"), changeFrequency: "monthly", priority: 0.6 },
  ];

  const tourPages: MetadataRoute.Sitemap = slugs.map((t) => ({
    url: siteUrl(`/tours/${t.slug}`),
    lastModified: t.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...tourPages];
}
