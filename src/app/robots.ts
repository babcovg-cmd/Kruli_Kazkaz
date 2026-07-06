// robots.txt — закрываем админку и API от индексации, указываем sitemap.

import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    sitemap: siteUrl("/sitemap.xml"),
    host: siteUrl(),
  };
}
