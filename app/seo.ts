import type { Metadata } from "next";

export const SITE_URL = "https://leetfs.com";
export const SITE_NAME = "Lee";
export const DEFAULT_DESCRIPTION = "Lee 的个人网站，包含交互式 3D 场景、技术博客、项目经历与友链。";
export const SOCIAL_IMAGE = "/og.png";

export function canonicalPath(pathname: string) {
  if (!pathname || pathname === "/") return "/";
  if (/\.[a-z0-9]+$/i.test(pathname)) return pathname;
  return `${pathname.replace(/\/$/, "")}/`;
}

export function absoluteUrl(pathname = "/") {
  return new URL(canonicalPath(pathname), SITE_URL).toString();
}

export function pageMetadata({
  title,
  description,
  pathname,
}: {
  title: string;
  description: string;
  pathname: string;
}): Metadata {
  const canonical = canonicalPath(pathname);
  const socialTitle = `${title} — ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: SITE_NAME,
      title: socialTitle,
      description,
      locale: "zh_CN",
      alternateLocale: ["en_US", "ja_JP"],
      images: [{ url: SOCIAL_IMAGE, width: 1729, height: 910, alt: socialTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      creator: "@leetfs1",
      images: [SOCIAL_IMAGE],
    },
  };
}
