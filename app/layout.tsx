import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "@/styles/global.css";
import { ClerkProvider } from "@/components/providers/ClerkProvider";
import { Header } from "@/components/layout/Header";
import { ConditionalFooter } from "@/components/layout/ConditionalFooter";
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
    "Licensed structural and ornamental steel construction. East Coast Florida. 17+ years experience. Request a bid for your project.",
  metadataBase: new URL("https://mwfab.co"),
  alternates: {
    canonical: "https://mwfab.co",
  },
  openGraph: {
    title: "McKinados Welding & Fabrication | Structural & Ornamental Steel | Florida",
    description:
      "Licensed structural and ornamental steel construction. East Coast Florida. 17+ years experience.",
    url: "https://mwfab.co",
    siteName: "McKinados Welding & Fabrication",
    locale: "en_US",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "McKinados Welding & Fabrication" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "McKinados Welding & Fabrication | Structural & Ornamental Steel | Florida",
    description: "Licensed structural and ornamental steel construction. East Coast Florida.",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <JsonLd />
        <ClerkProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <ConditionalFooter />
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}
