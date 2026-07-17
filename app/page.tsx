import type { Metadata } from "next";
import blogIndex from "./generated/blog-index.json";
import ImmersiveStudio from "./_studio/components/immersive-studio";

export const metadata: Metadata = {
  title: "Lee",
  description: "Lee 的个人 Website，包含交互式 3D 场景、博客、项目经历与友链。",
};

export default function HomePage() {
  return <ImmersiveStudio articles={blogIndex.articles} />;
}
