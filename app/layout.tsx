import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "@/styles/global.css";
import { ClerkProvider } from "@/components/providers/ClerkProvider";
import { Header } from "@/components/layout/Header";
import { ConditionalFooter } from "@/components/layout/ConditionalFooter";
import { PublicMain } from "@/components/layout/PublicMain";
import { JsonLd } from "@/components/seo/JsonLd";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// TODO: Replace /public/og/default.png with final 1200×630 OG artwork (see public/og/README.md).
const DEFAULT_OG_IMAGE = "/og/default.png";

export const metadata: Metadata = {
  title: "McKinados Welding & Fabrication | Structural & Ornamental Steel | Florida",
  description:
    "Florida state licensed structural and ornamental steel contractor (SCC131154189). 17+ years experience. Serving all of Florida from the East Coast.",
  metadataBase: new URL("https://mwfab.co"),
  alternates: {
    canonical: "https://mwfab.co",
  },
  openGraph: {
    title: "McKinados Welding & Fabrication | Structural & Ornamental Steel | Florida",
    description:
      "Florida state licensed structural and ornamental steel contractor (SCC131154189). 17+ years experience. Serving all of Florida from the East Coast.",
    url: "https://mwfab.co",
    siteName: "McKinados Welding & Fabrication",
    locale: "en_US",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "McKinados Welding & Fabrication" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "McKinados Welding & Fabrication | Structural & Ornamental Steel | Florida",
    description:
      "Florida state licensed structural and ornamental steel contractor (SCC131154189). 17+ years experience. Serving all of Florida from the East Coast.",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem("mwf-theme");document.documentElement.dataset.theme=t==="light"||t==="dark"?t:"dark"})();`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <JsonLd />
        <ClerkProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <PublicMain>{children}</PublicMain>
            <ConditionalFooter />
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}
