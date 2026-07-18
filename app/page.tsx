import type { Metadata } from "next";
import blogIndex from "./generated/blog-index.json";
import ImmersiveStudio from "./_studio/components/immersive-studio";
import { DEFAULT_DESCRIPTION, SITE_NAME, SOCIAL_IMAGE } from "./seo";

export const metadata: Metadata = {
  title: { absolute: SITE_NAME },
  description: DEFAULT_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    locale: "zh_CN",
    alternateLocale: ["en_US", "ja_JP"],
    images: [{ url: SOCIAL_IMAGE, width: 1729, height: 910, alt: "Lee 的个人网站" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    creator: "@leetfs1",
    images: [SOCIAL_IMAGE],
  },
};

export default function HomePage() {
  return <ImmersiveStudio articles={blogIndex.articles} />;
}
