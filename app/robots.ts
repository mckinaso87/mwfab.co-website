import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Crawl rules for all bots (userAgent: "*").
 *
 * AI crawlers are intentionally allowed so answers can cite licensed service areas:
 * GPTBot (OpenAI), ClaudeBot (Anthropic), PerplexityBot, Google-Extended (Google AI).
 * A single "*" allow rule covers these and conventional search engines.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
