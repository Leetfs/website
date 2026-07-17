import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = (() => {
  const origin = "https://leetfs.com";
  const title = "Lee";
  const description =
    "Lee 的个人 Website，包含交互式 3D 场景、博客、项目经历与友链。";
  const socialImage = `${origin}/og.png`;

  return {
    metadataBase: new URL(origin),
    title,
    description,
    icons: {
      icon: "/favicon-32x32.png",
      shortcut: "/favicon-32x32.png",
    },
    openGraph: {
      type: "website",
      url: origin,
      siteName: "Lee",
      title,
      description,
      images: [
        {
          url: socialImage,
          width: 1729,
          height: 910,
          alt: "Lee — 交互式个人 Website 与博客",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
})();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
