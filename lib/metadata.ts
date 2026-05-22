import type { Metadata } from "next";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

interface PublicPageMetadataOptions {
  title: string;
  description: string;
  pathname: string;
}

export function publicPageMetadata({
  title,
  description,
  pathname,
}: PublicPageMetadataOptions): Metadata {
  const canonical = absoluteUrl(pathname);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
