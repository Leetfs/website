import type { Metadata } from "next";
import JsonLd from "./_seo/json-ld";
import {
  absoluteUrl,
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SOCIAL_IMAGE,
} from "./seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: "Lee Website",
  authors: [{ name: "Lee", url: SITE_URL }],
  creator: "Lee",
  publisher: "Lee",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon-32x32.png",
    shortcut: "/favicon-32x32.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    locale: "zh_CN",
    alternateLocale: ["en_US", "ja_JP"],
    images: [
      {
        url: SOCIAL_IMAGE,
        width: 1729,
        height: 910,
        alt: "Lee 的个人网站",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    creator: "@leetfs1",
    images: [SOCIAL_IMAGE],
  },
};

const websiteGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      inLanguage: ["zh-CN", "en", "ja"],
      publisher: { "@id": `${SITE_URL}/#person` },
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Lee",
      url: SITE_URL,
      image: absoluteUrl("/lee-avatar.png"),
      sameAs: [
        "https://github.com/Leetfs",
        "https://x.com/leetfs1",
        "https://vrchat.com/home/user/usr_cb43b2cb-6c62-422a-9d47-3b6237fc8048",
        "https://t.me/leetfs",
      ],
      knowsAbout: ["Linux", "RISC-V", "LLVM", "Open source", "Web development"],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <JsonLd data={websiteGraph} />
        {children}
      </body>
    </html>
  );
}
