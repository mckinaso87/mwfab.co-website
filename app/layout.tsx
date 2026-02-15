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

export const metadata: Metadata = {
  title: "McKinados Welding & Fabrication | Structural & Ornamental Steel | Florida",
  description:
    "Licensed structural and ornamental steel construction. East Coast Florida. 17+ years experience. Request a bid for your project.",
  metadataBase: new URL("https://mwfab.co"),
  openGraph: {
    title: "McKinados Welding & Fabrication | Structural & Ornamental Steel | Florida",
    description:
      "Licensed structural and ornamental steel construction. East Coast Florida. 17+ years experience.",
    url: "https://mwfab.co",
    siteName: "McKinados Welding & Fabrication",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "McKinados Welding & Fabrication | Structural & Ornamental Steel | Florida",
    description: "Licensed structural and ornamental steel construction. East Coast Florida.",
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
