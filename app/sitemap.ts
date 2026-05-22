import type { MetadataRoute } from "next";
import { licensedCountySlugs } from "@/lib/licenses";
import { SERVICE_SLUGS } from "@/lib/services";
import { SITE_URL } from "@/lib/site";

const now = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const countyPages = licensedCountySlugs().map((county) => ({
    url: `${SITE_URL}/service-areas/${county}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const servicePages = SERVICE_SLUGS.map((slug) => ({
    url: `${SITE_URL}/services/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    ...servicePages,
    { url: `${SITE_URL}/service-areas`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    ...countyPages,
    { url: `${SITE_URL}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];
}
