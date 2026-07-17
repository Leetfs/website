"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import * as THREE from "three";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import sourceFileData from "../../generated/source-files.json";
import styles from "../studio.module.css";

type Article = {
  number: string;
  category: string;
  language: string;
  title: string;
  description: string;
  href: string;
  displayDate: string;
  updatedAt: string;
};

type Locale = "zh" | "en" | "ja";
type BuiltinSceneObject = "riscv" | "terminal" | "portal" | "shark" | "stage" | "light" | "mirror";
type SceneObject = BuiltinSceneObject | `primitive-${string}` | `copy-${string}`;
type CreateCategory = "threeD" | "lights" | "cameras" | "effects" | "helpers";
type CreateKind =
  | "empty" | "cube" | "sphere" | "capsule" | "cylinder" | "cone" | "plane" | "quad"
  | "circle" | "ring" | "torus" | "tetrahedron" | "octahedron" | "dodecahedron" | "icosahedron"
  | "directionalLight" | "pointLight" | "spotLight" | "ambientLight"
  | "perspectiveCamera" | "orthographicCamera"
  | "particleSystem" | "audioSource" | "reflectionProbe" | "volume"
  | "spawnPoint" | "waypoint" | "canvas";
type ToolMode = "translate" | "rotate" | "scale";
type AssetPanel = "blog" | "profile" | "friends" | "social" | null;
type ProjectFolder = "Website" | "Source" | "Scenes" | "Models" | "Content" | "Images" | "Materials";
type ProjectTab = "project" | "console" | "animation" | "code";
type MotionMode = "float" | "rotate" | "orbit" | "sway" | "bounce" | "pulse";
type MotionAxis = "x" | "y" | "z";
type MotionEasing = "linear" | "easeInOut" | "easeOut" | "bounce";
type PlaybackState = "stopped" | "playing" | "paused";
type ContextMenuState = {
  x: number;
  y: number;
  kind: "viewport" | "asset";
  objectId?: SceneObject;
  assetId?: string;
} | null;
type VirtualAsset = {
  id: string;
  label: string;
  path: string;
  folder: ProjectFolder;
  type: "scene" | "model" | "content" | "image" | "material" | "source";
  detail: string;
  panel?: Exclude<AssetPanel, null>;
  href?: string;
  sceneObject?: SceneObject;
  sourcePath?: string;
};
type SourceFile = { path: string; name: string; language: string; content: string };
type Orbit = { theta: number; phi: number; radius: number; target: THREE.Vector3 };
type InspectorState = {
  visible: boolean;
  hasLight: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  intensity: number;
  color: string;
  roughness: number;
  metalness: number;
};
type MotionConfig = {
  enabled: boolean;
  mode: MotionMode;
  axis: MotionAxis;
  easing: MotionEasing;
  loop: boolean;
  speed: number;
  amount: number;
  phase: number;
};
type TransformSnapshot = {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
};
type ArticleDocument = {
  number: string;
  title: string;
  description: string;
  category: string;
  language: string;
  href: string;
  displayDate: string;
  readingMinutes: number;
  html: string;
};

const LANGUAGE_STORAGE_KEY = "lee-studio-language";
const SCENE_STORAGE_KEY = "lee-unity-scene";
const builtinSceneObjects: BuiltinSceneObject[] = ["riscv", "terminal", "portal", "shark", "stage", "light", "mirror"];
const initialMotionSettings: Record<string, MotionConfig> = {
  riscv: { enabled: false, mode: "pulse", axis: "y", easing: "easeInOut", loop: true, speed: 1.15, amount: 0.08, phase: 0 },
  terminal: { enabled: false, mode: "float", axis: "y", easing: "easeInOut", loop: true, speed: 0.75, amount: 0.1, phase: 0.2 },
  portal: { enabled: true, mode: "float", axis: "y", easing: "easeInOut", loop: true, speed: 1, amount: 0.16, phase: 0 },
  shark: { enabled: false, mode: "sway", axis: "z", easing: "easeInOut", loop: true, speed: 0.9, amount: 0.14, phase: 0.35 },
};
const defaultMotionConfig = (id: SceneObject): MotionConfig => ({
  enabled: id === "portal",
  mode: "float",
  axis: "y",
  easing: "easeInOut",
  loop: true,
  speed: 1,
  amount: 0.12,
  phase: 0,
});
const sourceFiles = sourceFileData.files as SourceFile[];
const projectFolders: ProjectFolder[] = ["Website", "Source", "Scenes", "Models", "Content", "Images", "Materials"];
const createCatalog: { id: CreateCategory; icon: string; items: { id: CreateKind; icon: string }[] }[] = [
  {
    id: "threeD", icon: "◇", items: [
      { id: "empty", icon: "◎" }, { id: "cube", icon: "□" }, { id: "sphere", icon: "○" },
      { id: "capsule", icon: "▯" }, { id: "cylinder", icon: "◫" }, { id: "cone", icon: "△" },
      { id: "plane", icon: "▱" }, { id: "quad", icon: "▰" }, { id: "circle", icon: "◯" },
      { id: "ring", icon: "⊙" }, { id: "torus", icon: "◉" }, { id: "tetrahedron", icon: "△" },
      { id: "octahedron", icon: "◇" }, { id: "dodecahedron", icon: "⬡" }, { id: "icosahedron", icon: "◆" },
    ],
  },
  {
    id: "lights", icon: "☀", items: [
      { id: "directionalLight", icon: "☀" }, { id: "pointLight", icon: "✦" },
      { id: "spotLight", icon: "⌄" }, { id: "ambientLight", icon: "◌" },
    ],
  },
  {
    id: "cameras", icon: "▣", items: [
      { id: "perspectiveCamera", icon: "◫" }, { id: "orthographicCamera", icon: "▭" },
    ],
  },
  {
    id: "effects", icon: "✦", items: [
      { id: "particleSystem", icon: "⁙" }, { id: "audioSource", icon: "◖" },
      { id: "reflectionProbe", icon: "◈" }, { id: "volume", icon: "▧" },
    ],
  },
  {
    id: "helpers", icon: "⌖", items: [
      { id: "spawnPoint", icon: "⌖" }, { id: "waypoint", icon: "●" }, { id: "canvas", icon: "▤" },
    ],
  },
];

const createLabels: Record<Locale, {
  title: string;
  categories: Record<CreateCategory, string>;
  items: Record<CreateKind, string>;
}> = {
  zh: {
    title: "创建场景对象",
    categories: { threeD: "3D 对象", lights: "灯光", cameras: "相机", effects: "效果", helpers: "辅助对象" },
    items: {
      empty: "空对象", cube: "立方体", sphere: "球体", capsule: "胶囊体", cylinder: "圆柱体", cone: "圆锥体",
      plane: "平面", quad: "四边形", circle: "圆面", ring: "圆环面", torus: "圆环体", tetrahedron: "四面体",
      octahedron: "八面体", dodecahedron: "十二面体", icosahedron: "二十面体", directionalLight: "方向光",
      pointLight: "点光源", spotLight: "聚光灯", ambientLight: "环境光", perspectiveCamera: "透视相机",
      orthographicCamera: "正交相机", particleSystem: "粒子系统", audioSource: "音频源", reflectionProbe: "反射探针",
      volume: "后处理区域", spawnPoint: "出生点", waypoint: "路径点", canvas: "世界空间画布",
    },
  },
  en: {
    title: "Create scene object",
    categories: { threeD: "3D Object", lights: "Light", cameras: "Camera", effects: "Effects", helpers: "Helpers" },
    items: {
      empty: "Empty Object", cube: "Cube", sphere: "Sphere", capsule: "Capsule", cylinder: "Cylinder", cone: "Cone",
      plane: "Plane", quad: "Quad", circle: "Circle", ring: "Ring", torus: "Torus", tetrahedron: "Tetrahedron",
      octahedron: "Octahedron", dodecahedron: "Dodecahedron", icosahedron: "Icosahedron", directionalLight: "Directional Light",
      pointLight: "Point Light", spotLight: "Spot Light", ambientLight: "Ambient Light", perspectiveCamera: "Perspective Camera",
      orthographicCamera: "Orthographic Camera", particleSystem: "Particle System", audioSource: "Audio Source",
      reflectionProbe: "Reflection Probe", volume: "Post-process Volume", spawnPoint: "Spawn Point", waypoint: "Waypoint",
      canvas: "World-space Canvas",
    },
  },
  ja: {
    title: "シーンオブジェクトを作成",
    categories: { threeD: "3D オブジェクト", lights: "ライト", cameras: "カメラ", effects: "エフェクト", helpers: "ヘルパー" },
    items: {
      empty: "空のオブジェクト", cube: "キューブ", sphere: "スフィア", capsule: "カプセル", cylinder: "シリンダー", cone: "コーン",
      plane: "平面", quad: "クアッド", circle: "円", ring: "リング", torus: "トーラス", tetrahedron: "四面体",
      octahedron: "八面体", dodecahedron: "十二面体", icosahedron: "二十面体", directionalLight: "ディレクショナルライト",
      pointLight: "ポイントライト", spotLight: "スポットライト", ambientLight: "環境光", perspectiveCamera: "透視カメラ",
      orthographicCamera: "正投影カメラ", particleSystem: "パーティクル", audioSource: "オーディオソース",
      reflectionProbe: "反射プローブ", volume: "ポストプロセス領域", spawnPoint: "スポーン地点", waypoint: "ウェイポイント",
      canvas: "ワールド空間キャンバス",
    },
  },
};

const messages = {
  zh: {
    lang: "简体中文", exit: "GitHub ↗",
    menus: ["文件", "编辑", "资源", "游戏对象", "组件", "窗口"],
    hierarchy: "层级", sceneRoot: "Lee / Homepage", inspector: "检查器", project: "项目", console: "控制台",
    scene: "场景", game: "游戏", shaded: "着色", display: "显示器 1", gameObject: "场景对象",
    grid: "网格", wire: "线框", render: "渲染", lite: "轻量", balanced: "均衡",
    hint: "单击对象选择并聚焦 · 拖动旋转 · 中键平移 · 从项目窗口拖入模型",
    gamePreview: "游戏预览", running: "运行中", paused: "已暂停",
    transform: "变换", position: "位置", rotation: "旋转", scale: "缩放", meshRenderer: "网格渲染器",
    enabled: "启用", globalScale: "统一缩放", intensity: "强度",
    folders: ["站点", "源码", "场景", "模型", "内容", "图像", "材质"],
    blogAsset: "博客资源", profileAsset: "个人简介资源", friendsAsset: "友链资源", socialAsset: "个人链接",
    blogSearch: "搜索文章资源…", openBlog: "打开全部博客", openResume: "打开完整简历", openFriends: "打开全部友链",
    profileKicker: "LEE", profileTitle: "你好，我是 Lee。",
    profileText: "计算机科学与技术本科在读，目前在中国科学院软件研究所参与 openRuyi Linux 开发。主要关注 RISC-V、基础软件与系统，也参与 Web、CI/CD 和开源社区维护。",
    focus: "主要在做", now: "目前项目", values: "参与社区",
    objects: { riscv: "RISC-V 开发板", terminal: "Linux 便携终端", portal: "VRChat 传送门", shark: "宜家鲨鲨", stage: "展示舞台", light: "方向光", mirror: "镜面平板" },
    socialTitle: "这些地方也能找到我", socialText: "GitHub 放代码，X 和 Telegram 偶尔更新。VRChat 链接会直接打开我的个人页。",
    commands: { save: "保存场景", load: "载入场景", blog: "打开博客", profile: "打开个人简介", frame: "聚焦所选", reset: "重置变换", toggle: "启用 / 禁用", duplicate: "复制对象", delete: "删除对象", cube: "创建立方体", sphere: "创建球体", cylinder: "创建圆柱体", plane: "创建平面", material: "材质", project: "项目窗口", console: "控制台", grid: "切换网格", wire: "切换线框", open: "打开", copyPath: "复制资源路径", reveal: "在项目中显示", noSave: "还没有保存的场景", saved: "场景已保存", loaded: "已载入上次保存", copied: "路径已复制", files: "个资源", searchFiles: "搜索全部资源…", empty: "没有匹配的资源" },
  },
  en: {
    lang: "English", exit: "GitHub ↗",
    menus: ["File", "Edit", "Assets", "GameObject", "Component", "Window"],
    hierarchy: "Hierarchy", sceneRoot: "Lee / Homepage", inspector: "Inspector", project: "Project", console: "Console",
    scene: "Scene", game: "Game", shaded: "Shaded", display: "Display 1", gameObject: "Game Object",
    grid: "Grid", wire: "Wire", render: "Render", lite: "Lite", balanced: "Balanced",
    hint: "CLICK AN OBJECT TO SELECT AND FRAME · MIDDLE DRAG TO PAN · DRAG MODELS FROM PROJECT",
    gamePreview: "GAME PREVIEW", running: "RUNNING", paused: "PAUSED",
    transform: "Transform", position: "Position", rotation: "Rotation", scale: "Scale", meshRenderer: "Mesh Renderer",
    enabled: "Enabled", globalScale: "Global Scale", intensity: "Intensity",
    folders: ["Website", "Source", "Scenes", "Models", "Content", "Images", "Materials"],
    blogAsset: "Blog asset", profileAsset: "Profile asset", friendsAsset: "Friends asset", socialAsset: "Personal links",
    blogSearch: "Search article assets…", openBlog: "VIEW ALL POSTS", openResume: "OPEN RESUME", openFriends: "OPEN FRIEND LINKS",
    profileKicker: "LEE", profileTitle: "Hi, I'm Lee.",
    profileText: "I'm a Computer Science undergraduate working on openRuyi Linux at the Institute of Software, Chinese Academy of Sciences. My focus is RISC-V, systems software, web tooling, CI/CD, and open-source communities.",
    focus: "WORKING ON", now: "CURRENT PROJECT", values: "COMMUNITIES",
    objects: { riscv: "RISC-V Dev Board", terminal: "Linux Portable Terminal", portal: "VRChat Portal", shark: "IKEA Shark", stage: "Display Stage", light: "Directional Light", mirror: "Mirror Plane" },
    socialTitle: "Other places to find me", socialText: "Code goes on GitHub. I post occasionally on X and Telegram. The VRChat link opens my profile directly.",
    commands: { save: "Save Scene", load: "Load Saved Scene", blog: "Open Blog", profile: "Open Profile", frame: "Frame Selected", reset: "Reset Transform", toggle: "Set Active", duplicate: "Duplicate Object", delete: "Delete Object", cube: "Create Cube", sphere: "Create Sphere", cylinder: "Create Cylinder", plane: "Create Plane", material: "Material", project: "Project Window", console: "Console", grid: "Toggle Grid", wire: "Toggle Wireframe", open: "Open", copyPath: "Copy Asset Path", reveal: "Reveal in Project", noSave: "No saved scene yet", saved: "Scene saved", loaded: "Saved scene loaded", copied: "Path copied", files: "assets", searchFiles: "Search all assets…", empty: "No matching assets" },
  },
  ja: {
    lang: "日本語", exit: "GitHub ↗",
    menus: ["ファイル", "編集", "アセット", "ゲームオブジェクト", "コンポーネント", "ウィンドウ"],
    hierarchy: "ヒエラルキー", sceneRoot: "Lee / Homepage", inspector: "インスペクター", project: "プロジェクト", console: "コンソール",
    scene: "シーン", game: "ゲーム", shaded: "シェーディング", display: "ディスプレイ 1", gameObject: "ゲームオブジェクト",
    grid: "グリッド", wire: "ワイヤー", render: "描画", lite: "軽量", balanced: "標準",
    hint: "クリックで選択とフォーカス · 中ボタンで移動 · Project からモデルをドラッグ",
    gamePreview: "ゲームプレビュー", running: "実行中", paused: "一時停止",
    transform: "トランスフォーム", position: "位置", rotation: "回転", scale: "スケール", meshRenderer: "メッシュレンダラー",
    enabled: "有効", globalScale: "一括スケール", intensity: "強度",
    folders: ["サイト", "ソース", "シーン", "モデル", "コンテンツ", "画像", "マテリアル"],
    blogAsset: "ブログアセット", profileAsset: "プロフィール", friendsAsset: "リンクアセット", socialAsset: "個人リンク",
    blogSearch: "記事を検索…", openBlog: "すべてのブログを見る", openResume: "履歴書を開く", openFriends: "リンク一覧を開く",
    profileKicker: "LEE", profileTitle: "Lee です。",
    profileText: "コンピュータサイエンスを専攻し、中国科学院ソフトウェア研究所で openRuyi Linux の開発に参加しています。RISC-V、基盤ソフトウェア、Web、CI/CD、オープンソース活動に取り組んでいます。",
    focus: "主な分野", now: "現在のプロジェクト", values: "参加コミュニティ",
    objects: { riscv: "RISC-V 開発ボード", terminal: "Linux ポータブル端末", portal: "VRChat ポータル", shark: "IKEA サメ", stage: "展示ステージ", light: "ディレクショナルライト", mirror: "ミラープレーン" },
    socialTitle: "ほかの連絡先", socialText: "コードは GitHub に置いています。X と Telegram は時々更新します。VRChat はプロフィールを直接開きます。",
    commands: { save: "シーンを保存", load: "保存シーンを読込", blog: "ブログを開く", profile: "プロフィールを開く", frame: "選択を表示", reset: "トランスフォームをリセット", toggle: "有効 / 無効", duplicate: "オブジェクトを複製", delete: "オブジェクトを削除", cube: "キューブを作成", sphere: "スフィアを作成", cylinder: "シリンダーを作成", plane: "プレーンを作成", material: "マテリアル", project: "プロジェクト", console: "コンソール", grid: "グリッド切替", wire: "ワイヤー切替", open: "開く", copyPath: "パスをコピー", reveal: "プロジェクトに表示", noSave: "保存されたシーンはありません", saved: "シーンを保存しました", loaded: "保存シーンを読み込みました", copied: "パスをコピーしました", files: "件のアセット", searchFiles: "全アセットを検索…", empty: "一致するアセットはありません" },
  },
} as const;

const friends = [
  { name: "猫咕", description: { zh: "善良、纯粹的猫猫。", en: "A kind and genuine cat.", ja: "優しくて純粋な猫。" }, href: "https://github.com/lumigj", avatar: "/friends/lumi.PNG" },
  { name: "玲雨兰夜", description: { zh: "欢迎来到玲雨兰夜的个人站点。", en: "Welcome to Lingyu Lanye's personal site.", ja: "玲雨兰夜の個人サイトへようこそ。" }, href: "http://nhui.top/", avatar: "/friends/nhui.jpg" },
  { name: "香菜", description: { zh: "技术、生活与个人记录。", en: "Technology, life, and personal notes.", ja: "技術、生活、個人の記録。" }, href: "https://mdzz.pro/", avatar: "https://avatars.githubusercontent.com/u/85744569" },
  { name: "DokiDoki·大黄猫", description: { zh: "持续更新的网络杂货店。", en: "A continuously updated web variety store.", ja: "更新を続けるウェブ雑貨店。" }, href: "https://www.iacg.moe/", avatar: "https://www.iacg.moe/upload/cat.png" },
  { name: "Catherina", description: { zh: "是朋友，也是很好的同事", en: "A friend and a great colleague.", ja: "友人であり、素晴らしい同僚でもあります。" }, href: "https://catherina.moe/", avatar: "/friends/catherina.png" },
];

const personalLinks = [
  { label: "GitHub", monogram: "GH", detail: "Lee on GitHub", href: "https://github.com/Leetfs" },
  { label: "X", monogram: "X", detail: "Lee on X", href: "https://x.com/leetfs1" },
  { label: "VRChat", monogram: "VRC", detail: "Display name: Lee", href: "https://vrchat.com/home/user/usr_cb43b2cb-6c62-422a-9d47-3b6237fc8048" },
  { label: "Telegram", monogram: "TG", detail: "Lee on Telegram", href: "https://t.me/leetfs" },
  { label: "Email", monogram: "@", detail: "lee@mtftm.com", href: "mailto:lee@mtftm.com" },
] as const;

const profileProjects = [
  {
    period: "2026.03 — NOW",
    organization: { zh: "中国科学院软件研究所", en: "Institute of Software, Chinese Academy of Sciences", ja: "中国科学院ソフトウェア研究所" },
    title: { zh: "openRuyi Linux 发行版开发", en: "openRuyi Linux Distribution", ja: "openRuyi Linux ディストリビューション開発" },
    points: {
      zh: ["完成 Amazon SageMaker SDK 在 RISC-V 生态的重构与适配，处理 Namespace 冲突。", "追踪上游 CVE，通过补丁回移、编译和回归测试完成 RISC-V 环境下的安全修复。", "参与发行版工具的设计与维护，为基础设施补充自动化和 AI 能力。"],
      en: ["Refactored and adapted the Amazon SageMaker SDK for RISC-V, including namespace conflict resolution.", "Tracked upstream CVEs and completed RISC-V security fixes through backports, builds, and regression testing.", "Contributed to distribution tooling and added automation and AI-assisted infrastructure capabilities."],
      ja: ["Amazon SageMaker SDK を RISC-V 向けに再構成し、名前空間の競合を解決。", "上流 CVE を追跡し、バックポート、ビルド、回帰テストを通して RISC-V 環境の修正を実施。", "ディストリビューション用ツールの設計と保守、自動化・AI 機能の導入に参加。"],
    },
  },
  {
    period: "2025.05 — 2025.07",
    organization: { zh: "中国科学院软件研究所", en: "Institute of Software, Chinese Academy of Sciences", ja: "中国科学院ソフトウェア研究所" },
    title: { zh: "乘影 GPGPU LLVM 工具链开发", en: "Ventus GPGPU LLVM Toolchain", ja: "Ventus GPGPU LLVM ツールチェーン" },
    points: {
      zh: ["参与面向 RISC-V 自定义指令扩展的乘影 GPGPU 开源工具链建设。", "为 LLVM 工具链补充向量 half 类型支持。", "解决 CodeGen 阶段的 RISC-V 指令兼容性与代码生成正确性问题。"],
      en: ["Contributed to the open-source Ventus GPGPU toolchain for custom RISC-V instruction extensions.", "Added vector half-precision floating-point support to the LLVM toolchain.", "Resolved RISC-V instruction compatibility and correctness issues in CodeGen."],
      ja: ["RISC-V カスタム命令拡張向け Ventus GPGPU オープンソースツールチェーンに参加。", "LLVM ツールチェーンにベクトル half 型のサポートを追加。", "CodeGen における RISC-V 命令互換性とコード生成の正確性を改善。"],
    },
  },
  {
    period: "2025.02 — 2025.05",
    organization: { zh: "中国科学院软件研究所", en: "Institute of Software, Chinese Academy of Sciences", ja: "中国科学院ソフトウェア研究所" },
    title: { zh: "RISC-V 自动化测试与性能分析平台", en: "RISC-V Test and Performance Platform", ja: "RISC-V 自動テスト・性能分析基盤" },
    points: {
      zh: ["参与基于 Jenkins 的 RISC-V 自动化测试与性能分析平台开发。", "实现自动测试、版本性能对比和 HTML 报告生成。", "持续跟踪 OpenCV 在 RVV 场景下的 PR 与 commit 性能变化。"],
      en: ["Built Jenkins-based RISC-V automated testing and performance analysis workflows.", "Implemented test automation, cross-version comparisons, and HTML report generation.", "Tracked OpenCV PR and commit performance changes in RVV workloads."],
      ja: ["Jenkins ベースの RISC-V 自動テスト・性能分析基盤を開発。", "自動テスト、バージョン間比較、HTML レポート生成を実装。", "RVV 環境で OpenCV の PR・コミットごとの性能変化を継続的に追跡。"],
    },
  },
] as const;

const profileCommunities = [
  { name: "openRuyi", role: { zh: "Linux 发行版、软件包与安全维护", en: "Linux distribution, packaging, and security", ja: "Linux ディストリビューション、パッケージ、安全保守" } },
  { name: "Project Trans", role: { zh: "前端、CI/CD、Bot 与代码审查", en: "Frontend, CI/CD, bots, and code review", ja: "フロントエンド、CI/CD、Bot、コードレビュー" } },
  { name: "开往 Travellings", role: { zh: "Bot、前端与文档维护", en: "Bots, frontend, and documentation", ja: "Bot、フロントエンド、ドキュメント保守" } },
] as const;

function detectBrowserLocale(): Locale {
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const language of languages) {
    const normalized = language.toLocaleLowerCase();
    if (normalized.startsWith("zh")) return "zh";
    if (normalized.startsWith("ja")) return "ja";
  }
  return "en";
}

function markInteractive(object: THREE.Object3D, id: SceneObject) {
  object.traverse((child) => { child.userData.sceneObject = id; });
}

export default function ImmersiveStudio({ articles }: { articles: Article[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const objectNameInputRef = useRef<HTMLInputElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const controlsRef = useRef<TransformControls | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const detailLightsRef = useRef<THREE.Light[]>([]);
  const mirrorReflectorRef = useRef<Reflector | null>(null);
  const mirrorFallbackRef = useRef<THREE.Mesh | null>(null);
  const objectsRef = useRef(new Map<SceneObject, THREE.Object3D>());
  const selectedRef = useRef<SceneObject>("riscv");
  const gizmoDraggingRef = useRef(false);
  const playbackStateRef = useRef<PlaybackState>("stopped");
  const motionTimeRef = useRef(0);
  const lastMotionUiUpdateRef = useRef(-1);
  const qualityRef = useRef<"lite" | "balanced">("lite");
  const motionSettingsRef = useRef<Record<string, MotionConfig>>(initialMotionSettings);
  const motionBaseTransformsRef = useRef(new Map<SceneObject, TransformSnapshot>());
  const animatedObjectsRef = useRef(new Set<SceneObject>());
  const bottomPanelBeforeFullscreenRef = useRef(true);
  const deepLinkHandledRef = useRef(false);
  const assetPanelBodyRef = useRef<HTMLDivElement>(null);
  const articleRequestRef = useRef(0);
  const orbitRef = useRef<Orbit>({ theta: 0.15, phi: 1.15, radius: 9.4, target: new THREE.Vector3(0, 1.15, 0) });
  const originalTransformsRef = useRef(new Map<SceneObject, { position: THREE.Vector3; rotation: THREE.Euler; scale: THREE.Vector3 }>());

  const [locale, setLocale] = useState<Locale>("zh");
  const [selected, setSelected] = useState<SceneObject>("riscv");
  const [toolMode, setToolMode] = useState<ToolMode>("translate");
  const [assetPanel, setAssetPanel] = useState<AssetPanel>(null);
  const [showAllBlog, setShowAllBlog] = useState(false);
  const [articleDocument, setArticleDocument] = useState<ArticleDocument | null>(null);
  const [panelShareState, setPanelShareState] = useState<"idle" | "copied" | "failed">("idle");
  const [articleLoading, setArticleLoading] = useState(false);
  const [panelExpanded, setPanelExpanded] = useState(false);
  const [panelFullscreen, setPanelFullscreen] = useState(false);
  const [sceneObjectIds, setSceneObjectIds] = useState<SceneObject[]>(builtinSceneObjects);
  const [customLabels, setCustomLabels] = useState<Record<string, string>>({});
  const [playbackState, setPlaybackState] = useState<PlaybackState>("stopped");
  const [motionTime, setMotionTime] = useState(0);
  const [gridVisible, setGridVisible] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [snapValue, setSnapValue] = useState(0.25);
  const [toolSpace, setToolSpace] = useState<"local" | "world">("local");
  const [gizmosVisible, setGizmosVisible] = useState(true);
  const [sceneView, setSceneView] = useState<"scene" | "game">("scene");
  const [quality, setQuality] = useState<"lite" | "balanced">("lite");
  const [motionSettings, setMotionSettings] = useState<Record<string, MotionConfig>>(() => ({ ...initialMotionSettings }));
  const [inspector, setInspector] = useState<InspectorState>({ visible: true, hasLight: false, position: [-2.3, 1.1, 0], rotation: [0, 0, 0], scale: [1, 1, 1], intensity: 2.8, color: "#ffffff", roughness: 0.5, metalness: 0 });
  const [search, setSearch] = useState("");
  const [webglError, setWebglError] = useState("");
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [createMenuCategory, setCreateMenuCategory] = useState<CreateCategory>("threeD");
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [projectTab, setProjectTab] = useState<ProjectTab>("project");
  const [projectFolder, setProjectFolder] = useState<ProjectFolder>("Website");
  const [projectSearch, setProjectSearch] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [assetView, setAssetView] = useState<"grid" | "list">("grid");
  const [openSourcePath, setOpenSourcePath] = useState<string | null>(null);
  const [sourceSearch, setSourceSearch] = useState("");
  const [sourceLineWrap, setSourceLineWrap] = useState(false);
  const [activity, setActivity] = useState("Homepage.scene");
  const [consoleEntries, setConsoleEntries] = useState<string[]>([
    "Homepage.scene loaded",
    `${articles.filter((article) => article.language === "zh").length} content assets indexed`,
  ]);
  const [leftPanelVisible, setLeftPanelVisible] = useState(true);
  const [rightPanelVisible, setRightPanelVisible] = useState(true);
  const [bottomPanelVisible, setBottomPanelVisible] = useState(true);
  const [leftPanelWidth, setLeftPanelWidth] = useState(250);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(210);
  const t = messages[locale];
  const playing = playbackState === "playing";
  const playModeActive = playbackState !== "stopped";

  const objectLabel = useCallback((id: SceneObject) => {
    return customLabels[id] ?? (t.objects as Record<string, string>)[id] ?? id;
  }, [customLabels, t.objects]);
  const selectedMotion = motionSettings[selected] ?? defaultMotionConfig(selected);

  useEffect(() => {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const nextLocale = stored === "zh" || stored === "en" || stored === "ja" ? stored : detectBrowserLocale();
    queueMicrotask(() => setLocale(nextLocale));
  }, []);

  useEffect(() => {
    const previous = document.documentElement.lang;
    document.documentElement.lang = locale === "zh" ? "zh-CN" : locale;
    return () => { document.documentElement.lang = previous; };
  }, [locale]);

  useEffect(() => { playbackStateRef.current = playbackState; }, [playbackState]);
  useEffect(() => {
    motionSettingsRef.current = motionSettings;
  }, [motionSettings]);

  const chooseLocale = (nextLocale: Locale) => {
    setLocale(nextLocale);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLocale);
  };

  const toggleMotionPlayback = useCallback(() => {
    setPlaybackState((state) => state === "playing" ? "paused" : "playing");
  }, []);

  const pauseMotion = useCallback(() => {
    setPlaybackState((state) => state === "stopped" ? state : "paused");
  }, []);

  const stopMotion = useCallback(() => {
    motionTimeRef.current = 0;
    lastMotionUiUpdateRef.current = -1;
    setMotionTime(0);
    setPlaybackState("stopped");
  }, []);

  const seekMotion = useCallback((time: number) => {
    const nextTime = THREE.MathUtils.clamp(time, 0, 10);
    motionTimeRef.current = nextTime;
    setMotionTime(nextTime);
    setPlaybackState((state) => state === "stopped" ? "paused" : state);
  }, []);

  const filteredArticles = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase();
    const matches = articles.filter((article) => {
      const articleLocale = article.language.toLocaleLowerCase().split("-")[0];
      const matchesLocale = articleLocale === locale;
      const matchesSearch = !needle || `${article.title} ${article.description} ${article.category}`.toLocaleLowerCase().includes(needle);
      return matchesLocale && matchesSearch;
    }).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
    return showAllBlog ? matches : matches.slice(0, 5);
  }, [articles, locale, search, showAllBlog]);

  const projectAssets = useMemo<VirtualAsset[]>(() => {
    const localizedArticles = articles.filter((article) => article.language.toLocaleLowerCase().split("-")[0] === locale);
    const fixed: VirtualAsset[] = [
      { id: "website-blog", label: locale === "zh" ? "博客" : locale === "ja" ? "ブログ" : "Blog", path: "Website/Blog.asset", folder: "Website", type: "content", detail: `${localizedArticles.length} ${locale === "zh" ? "篇文档" : locale === "ja" ? "件の文書" : "Documents"}`, panel: "blog" },
      { id: "website-profile", label: locale === "zh" ? "个人简介" : locale === "ja" ? "プロフィール" : "Profile", path: "Website/Profile.asset", folder: "Website", type: "content", detail: "Profile / Resume", panel: "profile" },
      { id: "website-friends", label: locale === "zh" ? "友链" : locale === "ja" ? "リンク" : "Friends", path: "Website/Friends.asset", folder: "Website", type: "content", detail: `${friends.length} Links`, panel: "friends" },
      { id: "website-links", label: locale === "zh" ? "个人链接" : locale === "ja" ? "個人リンク" : "Personal Links", path: "Website/SocialLinks.asset", folder: "Website", type: "content", detail: `${personalLinks.length} Links`, panel: "social" },
      { id: "scene-home", label: "Homepage.scene", path: "Assets/Scenes/Homepage.scene", folder: "Scenes", type: "scene", detail: "Active Scene" },
      { id: "scene-content", label: "WebsiteContent.scene", path: "Assets/Scenes/WebsiteContent.scene", folder: "Scenes", type: "scene", detail: "Website / Blog / Profile / Friends" },
      { id: "model-riscv", label: "RISC-V Board.prefab", path: "Assets/Models/RISC-V Board.prefab", folder: "Models", type: "model", detail: "Procedural Prefab", sceneObject: "riscv" },
      { id: "model-terminal", label: "IBM-5155.glb", path: "Assets/Models/IBM-5155.glb", folder: "Models", type: "model", detail: "3D Model", sceneObject: "terminal" },
      { id: "model-portal", label: "VRChat-Portal.glb", path: "Assets/Models/VRChat-Portal.glb", folder: "Models", type: "model", detail: "3D Model", sceneObject: "portal" },
      { id: "model-shark", label: "BLÅHAJ.glb", path: "Assets/Models/BLÅHAJ.glb", folder: "Models", type: "model", detail: "3D Model", sceneObject: "shark" },
      { id: "image-avatar", label: "lee-avatar.png", path: "Assets/Images/lee-avatar.png", folder: "Images", type: "image", detail: "Profile Image" },
      { id: "image-og", label: "og.png", path: "Assets/Images/og.png", folder: "Images", type: "image", detail: "Social Preview" },
      { id: "image-lumi", label: "lumi.PNG", path: "Assets/Images/Friends/lumi.PNG", folder: "Images", type: "image", detail: "Friend Avatar" },
      { id: "image-nhui", label: "nhui.jpg", path: "Assets/Images/Friends/nhui.jpg", folder: "Images", type: "image", detail: "Friend Avatar" },
      { id: "mat-stage", label: "Stage.mat", path: "Assets/Materials/Stage.mat", folder: "Materials", type: "material", detail: "Metallic / Roughness" },
      { id: "mat-portal", label: "PortalGlow.mat", path: "Assets/Materials/PortalGlow.mat", folder: "Materials", type: "material", detail: "Emission" },
      { id: "mat-trans", label: "TransAccent.mat", path: "Assets/Materials/TransAccent.mat", folder: "Materials", type: "material", detail: "Color Palette" },
    ];
    const articleAssets: VirtualAsset[] = localizedArticles.map((article) => ({
      id: `article-${article.href}`,
      label: `${article.title}.md`,
      path: `Assets/Content/Blog/${article.language}/${article.href.replace(/^\/blog\/(?:en\/|ja\/)?/, "")}.md`,
      folder: "Content",
      type: "content",
      detail: `${article.language.toUpperCase()} · ${article.category} · ${article.displayDate}`,
      href: article.href,
    }));
    const sourceAssets: VirtualAsset[] = sourceFiles.map((file) => ({
      id: `source-${file.path}`,
      label: file.name,
      path: file.path,
      folder: "Source",
      type: "source",
      detail: file.language,
      sourcePath: file.path,
    }));
    return [...fixed, ...articleAssets, ...sourceAssets];
  }, [articles, locale]);

  const visibleProjectAssets = useMemo(() => {
    const needle = projectSearch.trim().toLocaleLowerCase();
    return projectAssets.filter((asset) => {
      const inFolder = needle ? true : asset.folder === projectFolder;
      const matches = !needle || `${asset.label} ${asset.path} ${asset.detail}`.toLocaleLowerCase().includes(needle);
      return inFolder && matches;
    });
  }, [projectAssets, projectFolder, projectSearch]);

  const activeSourceFile = useMemo(
    () => sourceFiles.find((file) => file.path === openSourcePath) ?? null,
    [openSourcePath],
  );
  const sourceLines = activeSourceFile?.content.split("\n") ?? [];
  const sourceMatchCount = sourceSearch
    ? sourceLines.filter((line) => line.toLocaleLowerCase().includes(sourceSearch.toLocaleLowerCase())).length
    : 0;

  const updateCamera = useCallback(() => {
    const camera = cameraRef.current;
    if (!camera) return;
    const orbit = orbitRef.current;
    const sinPhi = Math.sin(orbit.phi);
    camera.position.set(
      orbit.target.x + orbit.radius * sinPhi * Math.sin(orbit.theta),
      orbit.target.y + orbit.radius * Math.cos(orbit.phi),
      orbit.target.z + orbit.radius * sinPhi * Math.cos(orbit.theta),
    );
    camera.lookAt(orbit.target);
  }, []);

  const resetCamera = useCallback(() => {
    orbitRef.current = { theta: 0.15, phi: 1.15, radius: 9.4, target: new THREE.Vector3(0, 1.15, 0) };
    updateCamera();
  }, [updateCamera]);

  const setCameraView = useCallback((view: "front" | "right" | "top") => {
    if (view === "front") { orbitRef.current.theta = 0; orbitRef.current.phi = Math.PI / 2; }
    if (view === "right") { orbitRef.current.theta = Math.PI / 2; orbitRef.current.phi = Math.PI / 2; }
    if (view === "top") { orbitRef.current.theta = 0; orbitRef.current.phi = 0.02; }
    updateCamera();
  }, [updateCamera]);

  const syncInspector = useCallback(() => {
    const object = objectsRef.current.get(selectedRef.current);
    if (!object) return;
    let surface: THREE.MeshStandardMaterial | null = null;
    let sceneLight: THREE.Light | null = null;
    object.traverse((child) => {
      if (!sceneLight && child instanceof THREE.Light) sceneLight = child;
      if (!surface && child instanceof THREE.Mesh) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        surface = materials.find((material): material is THREE.MeshStandardMaterial => material instanceof THREE.MeshStandardMaterial) ?? null;
      }
    });
    setInspector({
      visible: object.visible,
      hasLight: Boolean(sceneLight),
      position: [object.position.x, object.position.y, object.position.z].map((value) => Number(value.toFixed(2))) as [number, number, number],
      rotation: [object.rotation.x, object.rotation.y, object.rotation.z].map((value) => Number(THREE.MathUtils.radToDeg(value).toFixed(2))) as [number, number, number],
      scale: [object.scale.x, object.scale.y, object.scale.z].map((value) => Number(value.toFixed(2))) as [number, number, number],
      intensity: sceneLight ? (sceneLight as THREE.Light).intensity : 0,
      color: surface ? `#${(surface as THREE.MeshStandardMaterial).color.getHexString()}` : "#ffffff",
      roughness: surface ? (surface as THREE.MeshStandardMaterial).roughness : 0.5,
      metalness: surface ? (surface as THREE.MeshStandardMaterial).metalness : 0,
    });
  }, []);

  const selectObject = useCallback((id: SceneObject) => {
    selectedRef.current = id;
    setSelected(id);
    const object = objectsRef.current.get(id);
    if (object && controlsRef.current) controlsRef.current.attach(object);
    queueMicrotask(syncInspector);
  }, [syncInspector]);

  const updateSelectedMotion = useCallback((patch: Partial<MotionConfig>) => {
    const id = selectedRef.current;
    setMotionSettings((settings) => ({
      ...settings,
      [id]: { ...(settings[id] ?? defaultMotionConfig(id)), ...patch },
    }));
  }, []);

  const resetSelected = useCallback(() => {
    const object = objectsRef.current.get(selectedRef.current);
    const original = originalTransformsRef.current.get(selectedRef.current);
    if (!object || !original) return;
    object.position.copy(original.position);
    object.rotation.copy(original.rotation);
    object.scale.copy(original.scale);
    syncInspector();
  }, [syncInspector]);

  const frameSelected = useCallback(() => {
    const object = objectsRef.current.get(selectedRef.current);
    if (!object) return;
    const sphere = new THREE.Box3().setFromObject(object).getBoundingSphere(new THREE.Sphere());
    orbitRef.current.target.copy(sphere.center);
    orbitRef.current.radius = THREE.MathUtils.clamp(sphere.radius * 3.6, 3.4, 13);
    updateCamera();
  }, [updateCamera]);

  const logAction = useCallback((message: string) => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setActivity(message);
    setConsoleEntries((entries) => [`${time}  ${message}`, ...entries].slice(0, 40));
  }, []);

  const createSceneObject = useCallback((kind: CreateKind) => {
    const scene = sceneRef.current;
    if (!scene) return;
    const surface = () => new THREE.MeshStandardMaterial({ color: 0x6f9ec3, roughness: 0.48, metalness: 0.12, side: THREE.DoubleSide });
    const helperSurface = (color = 0x74b9ef) => new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.9 });
    let object: THREE.Object3D;

    let geometry: THREE.BufferGeometry | undefined;
    if (kind === "cube") geometry = new THREE.BoxGeometry(1.1, 1.1, 1.1);
    if (kind === "sphere") geometry = new THREE.SphereGeometry(0.65, 24, 16);
    if (kind === "capsule") geometry = new THREE.CapsuleGeometry(0.42, 0.9, 6, 16);
    if (kind === "cylinder") geometry = new THREE.CylinderGeometry(0.55, 0.55, 1.2, 24);
    if (kind === "cone") geometry = new THREE.ConeGeometry(0.65, 1.3, 24);
    if (kind === "plane") geometry = new THREE.PlaneGeometry(1.7, 1.7);
    if (kind === "quad") geometry = new THREE.PlaneGeometry(1.6, 1);
    if (kind === "circle") geometry = new THREE.CircleGeometry(0.8, 32);
    if (kind === "ring") geometry = new THREE.RingGeometry(0.42, 0.8, 32);
    if (kind === "torus") geometry = new THREE.TorusGeometry(0.62, 0.2, 12, 32);
    if (kind === "tetrahedron") geometry = new THREE.TetrahedronGeometry(0.8);
    if (kind === "octahedron") geometry = new THREE.OctahedronGeometry(0.8);
    if (kind === "dodecahedron") geometry = new THREE.DodecahedronGeometry(0.75);
    if (kind === "icosahedron") geometry = new THREE.IcosahedronGeometry(0.75);
    if (geometry) {
      const mesh = new THREE.Mesh(geometry, surface());
      if (kind === "plane" || kind === "circle" || kind === "ring") mesh.rotation.x = -Math.PI / 2;
      object = mesh;
    } else if (kind === "empty") {
      const group = new THREE.Group();
      group.add(new THREE.AxesHelper(0.85));
      group.add(new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), helperSurface(0xd9e8f5)));
      object = group;
    } else if (kind.endsWith("Light")) {
      const group = new THREE.Group();
      let light: THREE.Light;
      if (kind === "directionalLight") {
        const directional = new THREE.DirectionalLight(0xfff1dd, 2.4);
        directional.target.position.set(0, -1, 0.5);
        group.add(directional.target);
        light = directional;
      } else if (kind === "pointLight") {
        light = new THREE.PointLight(0x9fd3ff, 8, 8, 2);
      } else if (kind === "spotLight") {
        const spot = new THREE.SpotLight(0xffd7a1, 10, 10, Math.PI / 5, 0.35, 1.5);
        spot.target.position.set(0, -1, 0.6);
        group.add(spot.target);
        light = spot;
      } else {
        light = new THREE.AmbientLight(0xc6dcff, 0.75);
      }
      group.add(light);
      const markerGeometry = kind === "spotLight" ? new THREE.ConeGeometry(0.28, 0.55, 12) : new THREE.SphereGeometry(0.22, 12, 8);
      group.add(new THREE.Mesh(markerGeometry, helperSurface(kind === "ambientLight" ? 0xb69cff : 0xffd17a)));
      object = group;
    } else if (kind === "perspectiveCamera" || kind === "orthographicCamera") {
      const group = new THREE.Group();
      const sceneCamera = kind === "perspectiveCamera"
        ? new THREE.PerspectiveCamera(50, 1.5, 0.15, 4)
        : new THREE.OrthographicCamera(-1.2, 1.2, 0.8, -0.8, 0.15, 4);
      sceneCamera.position.z = 0.05;
      sceneCamera.lookAt(0, 0, -1);
      group.add(sceneCamera);
      group.add(new THREE.CameraHelper(sceneCamera));
      group.add(new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.24, 0.38), helperSurface(0x8ac8ff)));
      object = group;
    } else if (kind === "particleSystem") {
      const group = new THREE.Group();
      for (let index = 0; index < 18; index += 1) {
        const particle = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), new THREE.MeshBasicMaterial({ color: index % 2 ? 0x7ed8ff : 0xf5a9b8 }));
        const angle = index * 2.17;
        const radius = 0.2 + (index % 5) * 0.11;
        particle.position.set(Math.cos(angle) * radius, (index % 7) * 0.13, Math.sin(angle) * radius);
        group.add(particle);
      }
      object = group;
    } else {
      const geometry = kind === "audioSource"
        ? new THREE.TorusGeometry(0.42, 0.07, 10, 28)
        : kind === "reflectionProbe"
          ? new THREE.SphereGeometry(0.55, 16, 10)
          : kind === "volume"
            ? new THREE.BoxGeometry(1.5, 1.1, 1.5)
            : kind === "canvas"
              ? new THREE.PlaneGeometry(1.8, 1.05)
              : kind === "spawnPoint"
                ? new THREE.ConeGeometry(0.32, 0.75, 12)
                : new THREE.SphereGeometry(0.18, 12, 8);
      object = new THREE.Mesh(geometry, helperSurface(kind === "spawnPoint" ? 0x8be0a4 : 0xb394e8));
    }

    object.position.set(0, kind === "plane" || kind === "circle" || kind === "ring" ? 0.3 : 0.85, 0);
    const id = `primitive-${kind}-${Date.now()}` as SceneObject;
    markInteractive(object, id);
    scene.add(object);
    objectsRef.current.set(id, object);
    originalTransformsRef.current.set(id, { position: object.position.clone(), rotation: object.rotation.clone(), scale: object.scale.clone() });
    setSceneObjectIds((ids) => [...ids, id]);
    setMotionSettings((settings) => ({ ...settings, [id]: defaultMotionConfig(id) }));
    const label = createLabels[locale].items[kind];
    setCustomLabels((labels) => ({ ...labels, [id]: label }));
    selectObject(id);
    logAction(`${createLabels[locale].title}: ${label}`);
  }, [locale, logAction, selectObject]);

  const duplicateSelected = useCallback(() => {
    const sourceId = selectedRef.current;
    const source = objectsRef.current.get(sourceId);
    const scene = sceneRef.current;
    if (!source || !scene || source instanceof THREE.Light) return;
    const id = `copy-${sourceId}-${Date.now()}` as SceneObject;
    const clone = source.clone(true);
    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.geometry = child.geometry.clone();
      child.material = Array.isArray(child.material) ? child.material.map((material) => material.clone()) : child.material.clone();
    });
    clone.position.x += 0.8;
    clone.position.z += 0.45;
    markInteractive(clone, id);
    scene.add(clone);
    objectsRef.current.set(id, clone);
    originalTransformsRef.current.set(id, { position: clone.position.clone(), rotation: clone.rotation.clone(), scale: clone.scale.clone() });
    setSceneObjectIds((ids) => [...ids, id]);
    setMotionSettings((settings) => ({
      ...settings,
      [id]: { ...(settings[sourceId] ?? defaultMotionConfig(sourceId)), enabled: false },
    }));
    setCustomLabels((labels) => ({ ...labels, [id]: `${labels[sourceId] ?? objectLabel(sourceId)} Copy` }));
    selectObject(id);
    logAction(`Duplicated ${objectLabel(sourceId)}`);
  }, [logAction, objectLabel, selectObject]);

  const deleteSelected = useCallback(() => {
    const id = selectedRef.current;
    if (builtinSceneObjects.includes(id as BuiltinSceneObject)) {
      const object = objectsRef.current.get(id);
      if (object) object.visible = false;
      syncInspector();
      logAction(`${objectLabel(id)} disabled`);
      return;
    }
    const object = objectsRef.current.get(id);
    if (!object) return;
    sceneRef.current?.remove(object);
    objectsRef.current.delete(id);
    originalTransformsRef.current.delete(id);
    motionBaseTransformsRef.current.delete(id);
    animatedObjectsRef.current.delete(id);
    setSceneObjectIds((ids) => ids.filter((entry) => entry !== id));
    setMotionSettings((settings) => {
      const next = { ...settings };
      delete next[id];
      return next;
    });
    setCustomLabels((labels) => {
      const next = { ...labels };
      delete next[id];
      return next;
    });
    selectObject("riscv");
    logAction(`Deleted ${objectLabel(id)}`);
  }, [logAction, objectLabel, selectObject, syncInspector]);

  const updateMaterial = useCallback((property: "color" | "roughness" | "metalness", value: string | number) => {
    const object = objectsRef.current.get(selectedRef.current);
    if (!object) return;
    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if (!(material instanceof THREE.MeshStandardMaterial)) return;
        if (property === "color") material.color.set(value as string);
        else material[property] = value as number;
        material.needsUpdate = true;
      });
    });
    syncInspector();
  }, [syncInspector]);

  const beginPanelResize = useCallback((panel: "left" | "right" | "bottom", event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const startLeft = leftPanelWidth;
    const startRight = rightPanelWidth;
    const startBottom = bottomPanelHeight;
    document.body.style.cursor = panel === "bottom" ? "row-resize" : "col-resize";
    document.body.style.userSelect = "none";
    const move = (moveEvent: PointerEvent) => {
      if (panel === "left") setLeftPanelWidth(THREE.MathUtils.clamp(startLeft + moveEvent.clientX - startX, 180, 420));
      if (panel === "right") setRightPanelWidth(THREE.MathUtils.clamp(startRight - moveEvent.clientX + startX, 240, 500));
      if (panel === "bottom") setBottomPanelHeight(THREE.MathUtils.clamp(startBottom - moveEvent.clientY + startY, 140, 440));
    };
    const stop = () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  }, [bottomPanelHeight, leftPanelWidth, rightPanelWidth]);

  const exitAssetFullscreen = useCallback(() => {
    setPanelFullscreen(false);
    setBottomPanelVisible(bottomPanelBeforeFullscreenRef.current);
  }, []);

  const toggleAssetFullscreen = useCallback(() => {
    if (panelFullscreen) {
      exitAssetFullscreen();
      return;
    }
    bottomPanelBeforeFullscreenRef.current = bottomPanelVisible;
    setBottomPanelVisible(false);
    setPanelExpanded(true);
    setPanelFullscreen(true);
  }, [bottomPanelVisible, exitAssetFullscreen, panelFullscreen]);

  const closeAssetPanel = useCallback(() => {
    articleRequestRef.current += 1;
    if (panelFullscreen) exitAssetFullscreen();
    setAssetPanel(null);
    setArticleDocument(null);
    setArticleLoading(false);
    setPanelExpanded(false);
  }, [exitAssetFullscreen, panelFullscreen]);

  const openArticlePreview = useCallback(async (article: Article) => {
    const requestId = ++articleRequestRef.current;
    setArticleLoading(true);
    try {
      const slug = article.href.replace(/^\/blog\/?/, "").split("/").map(encodeURIComponent).join("/");
      const response = await fetch(`/api/articles/${slug}.json`);
      if (!response.ok) throw new Error("preview unavailable");
      const document = await response.json() as ArticleDocument;
      if (requestId !== articleRequestRef.current) return;
      if (assetPanelBodyRef.current) {
        assetPanelBodyRef.current.scrollTop = 0;
        assetPanelBodyRef.current.scrollLeft = 0;
      }
      setArticleDocument(document);
      setAssetPanel("blog");
      setPanelExpanded(true);
      logAction(`Opened ${article.title}`);
    } catch {
      if (requestId === articleRequestRef.current) logAction(`Could not preview ${article.title}`);
    } finally {
      if (requestId === articleRequestRef.current) setArticleLoading(false);
    }
  }, [logAction]);

  useEffect(() => {
    const body = assetPanelBodyRef.current;
    if (!body) return;
    body.scrollTop = 0;
    body.scrollLeft = 0;
  }, [assetPanel, articleDocument?.href]);

  useEffect(() => {
    if (deepLinkHandledRef.current) return;
    deepLinkHandledRef.current = true;
    const params = new URLSearchParams(window.location.search);
    const articleHref = params.get("article");
    if (articleHref) {
      const article = articles.find((entry) => entry.href === articleHref);
      if (article) {
        window.history.replaceState(null, "", "/");
        queueMicrotask(() => void openArticlePreview(article));
      }
      return;
    }
    const panel = params.get("panel");
    if (panel === "blog" || panel === "profile" || panel === "friends" || panel === "social") {
      window.history.replaceState(null, "", "/");
      queueMicrotask(() => setAssetPanel(panel));
    }
  }, [articles, openArticlePreview]);

  const copyPanelShareLink = async () => {
    if (!assetPanel) return;
    const url = new URL("/", window.location.origin);
    if (articleDocument?.href) url.searchParams.set("article", articleDocument.href);
    else url.searchParams.set("panel", assetPanel);
    try {
      await navigator.clipboard.writeText(url.href);
      setPanelShareState("copied");
    } catch {
      const input = document.createElement("textarea");
      input.value = url.href;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      const copied = document.execCommand("copy");
      input.remove();
      setPanelShareState(copied ? "copied" : "failed");
    }
    window.setTimeout(() => setPanelShareState("idle"), 1800);
  };

  const saveScene = useCallback(() => {
    const transforms: Record<string, { visible: boolean; position: number[]; rotation: number[]; scale: number[] }> = {};
    objectsRef.current.forEach((object, id) => {
      const motionBase = animatedObjectsRef.current.has(id) ? motionBaseTransformsRef.current.get(id) : null;
      transforms[id] = {
        visible: object.visible,
        position: (motionBase?.position ?? object.position).toArray(),
        rotation: motionBase
          ? [motionBase.rotation.x, motionBase.rotation.y, motionBase.rotation.z]
          : [object.rotation.x, object.rotation.y, object.rotation.z],
        scale: (motionBase?.scale ?? object.scale).toArray(),
      };
    });
    window.localStorage.setItem(SCENE_STORAGE_KEY, JSON.stringify({
      transforms,
      motionSettings,
      labels: customLabels,
      orbit: orbitRef.current,
      editor: { snapEnabled, snapValue, toolSpace, gridVisible, wireframe, quality, gizmosVisible },
      layout: {
        leftPanelVisible,
        rightPanelVisible,
        bottomPanelVisible,
        leftPanelWidth,
        rightPanelWidth,
        bottomPanelHeight,
      },
    }));
    logAction(t.commands.saved);
  }, [bottomPanelHeight, bottomPanelVisible, customLabels, gizmosVisible, gridVisible, leftPanelVisible, leftPanelWidth, logAction, motionSettings, quality, rightPanelVisible, rightPanelWidth, snapEnabled, snapValue, t.commands.saved, toolSpace, wireframe]);

  const loadScene = useCallback(() => {
    const saved = window.localStorage.getItem(SCENE_STORAGE_KEY);
    if (!saved) {
      logAction(t.commands.noSave);
      return;
    }
    try {
      const data = JSON.parse(saved) as {
        transforms?: Record<string, { visible: boolean; position: number[]; rotation: number[]; scale: number[] }>;
        motionSettings?: Record<string, Partial<MotionConfig>>;
        labels?: Record<string, string>;
        orbit?: { theta: number; phi: number; radius: number; target: { x: number; y: number; z: number } };
        editor?: { snapEnabled?: boolean; snapValue?: number; toolSpace?: "local" | "world"; gridVisible?: boolean; wireframe?: boolean; quality?: "lite" | "balanced"; gizmosVisible?: boolean };
        layout?: { leftPanelVisible: boolean; rightPanelVisible: boolean; bottomPanelVisible: boolean; leftPanelWidth: number; rightPanelWidth: number; bottomPanelHeight: number };
      };
      Object.entries(data.transforms ?? {}).forEach(([id, transform]) => {
        const object = objectsRef.current.get(id as SceneObject);
        if (!object) return;
        object.visible = transform.visible;
        object.position.fromArray(transform.position);
        object.rotation.set(transform.rotation[0], transform.rotation[1], transform.rotation[2]);
        object.scale.fromArray(transform.scale);
      });
      const restoredMotionSettings: Record<string, MotionConfig> = { ...initialMotionSettings };
      Object.entries(data.motionSettings ?? {}).forEach(([id, config]) => {
        const fallback = defaultMotionConfig(id as SceneObject);
        restoredMotionSettings[id] = {
          enabled: typeof config.enabled === "boolean" ? config.enabled : fallback.enabled,
          mode: ["float", "rotate", "orbit", "sway", "bounce", "pulse"].includes(config.mode ?? "") ? config.mode as MotionMode : fallback.mode,
          axis: ["x", "y", "z"].includes(config.axis ?? "") ? config.axis as MotionAxis : fallback.axis,
          easing: ["linear", "easeInOut", "easeOut", "bounce"].includes(config.easing ?? "") ? config.easing as MotionEasing : fallback.easing,
          loop: typeof config.loop === "boolean" ? config.loop : fallback.loop,
          speed: THREE.MathUtils.clamp(Number(config.speed) || fallback.speed, 0.25, 2.5),
          amount: THREE.MathUtils.clamp(Number(config.amount) || fallback.amount, 0.04, 0.4),
          phase: THREE.MathUtils.clamp(Number(config.phase) || 0, 0, 1),
        };
      });
      motionTimeRef.current = 0;
      setMotionTime(0);
      setPlaybackState("stopped");
      setMotionSettings(restoredMotionSettings);
      if (data.labels && typeof data.labels === "object") setCustomLabels(data.labels);
      if (data.editor) {
        setSnapEnabled(Boolean(data.editor.snapEnabled));
        setSnapValue(THREE.MathUtils.clamp(Number(data.editor.snapValue) || 0.25, 0.05, 1));
        setToolSpace(data.editor.toolSpace === "world" ? "world" : "local");
        if (typeof data.editor.gridVisible === "boolean") setGridVisible(data.editor.gridVisible);
        if (typeof data.editor.wireframe === "boolean") setWireframe(data.editor.wireframe);
        if (data.editor.quality === "balanced" || data.editor.quality === "lite") setQuality(data.editor.quality);
        if (typeof data.editor.gizmosVisible === "boolean") setGizmosVisible(data.editor.gizmosVisible);
      }
      if (data.orbit) {
        orbitRef.current = {
          theta: data.orbit.theta,
          phi: data.orbit.phi,
          radius: data.orbit.radius,
          target: new THREE.Vector3(data.orbit.target.x, data.orbit.target.y, data.orbit.target.z),
        };
        updateCamera();
      }
      if (data.layout) {
        setLeftPanelVisible(data.layout.leftPanelVisible);
        setRightPanelVisible(data.layout.rightPanelVisible);
        setBottomPanelVisible(data.layout.bottomPanelVisible);
        setLeftPanelWidth(data.layout.leftPanelWidth);
        setRightPanelWidth(data.layout.rightPanelWidth);
        setBottomPanelHeight(data.layout.bottomPanelHeight);
      }
      syncInspector();
      logAction(t.commands.loaded);
    } catch {
      logAction(t.commands.noSave);
    }
  }, [logAction, syncInspector, t.commands.loaded, t.commands.noSave, updateCamera]);

  const toggleSelected = useCallback(() => {
    const object = objectsRef.current.get(selectedRef.current);
    if (!object) return;
    object.visible = !object.visible;
    syncInspector();
    logAction(`${objectLabel(selectedRef.current)}: ${object.visible ? "Active" : "Inactive"}`);
  }, [logAction, objectLabel, syncInspector]);

  const openProjectAsset = useCallback((asset: VirtualAsset) => {
    setSelectedAsset(asset.id);
    if (asset.sourcePath) {
      setOpenSourcePath(asset.sourcePath);
      setSourceSearch("");
      setProjectTab("code");
      setBottomPanelVisible(true);
      setBottomPanelHeight((height) => Math.max(height, 320));
      logAction(`${t.commands.open}: ${asset.path}`);
      return;
    }
    if (asset.sceneObject) {
      selectObject(asset.sceneObject);
      queueMicrotask(frameSelected);
      logAction(`${t.commands.open}: ${asset.label}`);
      return;
    }
    if (asset.panel) {
      articleRequestRef.current += 1;
      setArticleLoading(false);
      if (assetPanelBodyRef.current) {
        assetPanelBodyRef.current.scrollTop = 0;
        assetPanelBodyRef.current.scrollLeft = 0;
      }
      setArticleDocument(null);
      setShowAllBlog(false);
      setAssetPanel(asset.panel);
      logAction(`${t.commands.open}: ${asset.label}`);
      return;
    }
    if (asset.href) {
      const article = articles.find((entry) => entry.href === asset.href);
      if (article) void openArticlePreview(article);
      return;
    }
    logAction(`${t.commands.reveal}: ${asset.path}`);
  }, [articles, frameSelected, logAction, openArticlePreview, selectObject, t.commands.open, t.commands.reveal]);

  useEffect(() => {
    const closeMenus = () => {
      setActiveMenu(null);
      setCreateMenuOpen(false);
      setContextMenu(null);
    };
    window.addEventListener("pointerdown", closeMenus);
    return () => window.removeEventListener("pointerdown", closeMenus);
  }, []);

  useEffect(() => {
    const host = viewportRef.current;
    if (!host) return;
    const sceneObjects = objectsRef.current;
    const originalTransforms = originalTransformsRef.current;
    const motionBaseTransforms = motionBaseTransformsRef.current;
    const animatedObjects = animatedObjectsRef.current;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "low-power" });
    } catch {
      queueMicrotask(() => setWebglError("WebGL is unavailable."));
      return;
    }

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x30333a);
    scene.fog = new THREE.Fog(0x30333a, 18, 40);
    rendererRef.current = renderer;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = false;
    renderer.setPixelRatio(1);
    host.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 70);
    cameraRef.current = camera;
    updateCamera();

    scene.add(new THREE.HemisphereLight(0xe2eaff, 0x292734, 1.8));
    const keyLight = new THREE.DirectionalLight(0xffefdc, 2.8);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = false;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -8;
    keyLight.shadow.camera.right = 8;
    keyLight.shadow.camera.top = 8;
    keyLight.shadow.camera.bottom = -8;
    scene.add(keyLight);
    keyLightRef.current = keyLight;
    sceneObjects.set("light", keyLight);

    const cyanRim = new THREE.PointLight(0x5bcefa, 7, 11, 1.8);
    cyanRim.position.set(-4.2, 3.2, -1.8);
    cyanRim.visible = false;
    const pinkFill = new THREE.PointLight(0xf5a9b8, 5.5, 10, 1.7);
    pinkFill.position.set(4, 2.5, 2.5);
    pinkFill.visible = false;
    scene.add(cyanRim, pinkFill);
    detailLightsRef.current = [cyanRim, pinkFill];

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ color: 0x282b31, roughness: 0.92 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = false;
    scene.add(floor);
    const grid = new THREE.GridHelper(30, 30, 0x7b8392, 0x484d57);
    grid.position.y = 0.012;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.56;
    scene.add(grid);
    gridRef.current = grid;

    const stage = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.8, 0.22, 32), new THREE.MeshStandardMaterial({ color: 0x464a52, roughness: 0.5, metalness: 0.25 }));
    stage.position.y = 0.11;
    stage.castShadow = false;
    stage.receiveShadow = false;
    scene.add(stage);
    sceneObjects.set("stage", stage);
    markInteractive(stage, "stage");

    const transColors = [0x5bcefa, 0xf5a9b8, 0xffffff, 0xf5a9b8, 0x5bcefa];
    transColors.forEach((color, index) => {
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(3.8, 0.032, 0.065),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.42, roughness: 0.32 }),
      );
      stripe.position.set(0, 0.05 + index * 0.034, 4.17);
      scene.add(stripe);
    });

    const mirror = new THREE.Group();
    const mirrorFallback = new THREE.Mesh(
      new THREE.PlaneGeometry(7.2, 3.4),
      new THREE.MeshStandardMaterial({ color: 0x586273, roughness: 0.2, metalness: 0.75 }),
    );
    const mirrorReflector = new Reflector(new THREE.PlaneGeometry(7.2, 3.4), {
      clipBias: 0.003,
      textureWidth: 768,
      textureHeight: 384,
      color: 0x8b96a6,
    });
    mirrorReflector.visible = false;
    mirror.add(mirrorFallback, mirrorReflector);
    mirror.position.set(0, 2.05, -4.4);
    scene.add(mirror);
    mirrorFallbackRef.current = mirrorFallback;
    mirrorReflectorRef.current = mirrorReflector;
    sceneObjects.set("mirror", mirror);
    markInteractive(mirror, "mirror");

    const chip = new THREE.Group();
    const pcbMaterial = new THREE.MeshStandardMaterial({ color: 0x164d3c, roughness: 0.5, metalness: 0.18 });
    const darkComponentMaterial = new THREE.MeshStandardMaterial({ color: 0x111418, roughness: 0.32, metalness: 0.42 });
    const metalMaterial = new THREE.MeshStandardMaterial({ color: 0xb7c0c4, roughness: 0.25, metalness: 0.88 });
    const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xd6a733, roughness: 0.3, metalness: 0.78 });
    const boardBase = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.09, 1.42), pcbMaterial);
    boardBase.position.y = 0.055;
    chip.add(boardBase);

    const addBoardBox = (size: [number, number, number], position: [number, number, number], material: THREE.Material) => {
      const part = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
      part.position.set(...position);
      chip.add(part);
      return part;
    };
    addBoardBox([0.58, 0.13, 0.58], [-0.16, 0.165, -0.03], darkComponentMaterial);
    const heatSpreader = addBoardBox([0.42, 0.035, 0.42], [-0.16, 0.25, -0.03], new THREE.MeshStandardMaterial({ color: 0x31383d, metalness: 0.72, roughness: 0.22 }));
    heatSpreader.rotation.y = 0.04;
    addBoardBox([0.1, 0.11, 0.82], [0.52, 0.15, 0.14], new THREE.MeshStandardMaterial({ color: 0xded6b6, roughness: 0.4 }));
    addBoardBox([0.1, 0.11, 0.82], [0.72, 0.15, 0.14], new THREE.MeshStandardMaterial({ color: 0xded6b6, roughness: 0.4 }));
    addBoardBox([0.92, 0.1, 0.1], [-0.05, 0.14, 0.53], new THREE.MeshStandardMaterial({ color: 0xe9dfbc, roughness: 0.42 }));
    addBoardBox([0.27, 0.24, 0.27], [0.69, 0.205, -0.58], metalMaterial);
    addBoardBox([0.24, 0.15, 0.27], [0.37, 0.16, -0.58], metalMaterial);
    addBoardBox([0.24, 0.15, 0.27], [0.08, 0.16, -0.58], metalMaterial);
    addBoardBox([0.22, 0.1, 0.22], [-0.21, 0.135, -0.61], metalMaterial);
    addBoardBox([0.3, 0.11, 0.2], [-0.58, 0.14, -0.6], darkComponentMaterial);

    for (const z of [-0.42, -0.28, -0.14, 0, 0.14, 0.28, 0.42]) {
      addBoardBox([0.085, 0.1, 0.085], [-0.82, 0.14, z], darkComponentMaterial);
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.12, 8), goldMaterial);
      pin.position.set(-0.82, 0.23, z);
      chip.add(pin);
    }
    for (const [x, z] of [[-0.72, -0.45], [-0.54, -0.41], [0.2, 0.32], [0.31, 0.43]] as const) {
      const capacitor = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.16, 12), new THREE.MeshStandardMaterial({ color: 0x303941, metalness: 0.55, roughness: 0.28 }));
      capacitor.position.set(x, 0.17, z);
      chip.add(capacitor);
    }
    for (const [x, z] of [[-0.82, -0.6], [-0.82, 0.6], [0.82, -0.6], [0.82, 0.6]] as const) {
      const mount = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.025, 16), metalMaterial);
      mount.position.set(x, 0.115, z);
      chip.add(mount);
    }
    [[-0.52, 0.32, 0.44], [-0.55, 0.22, 0.35], [0.18, -0.27, 0.52]].forEach(([x, z, length]) => {
      addBoardBox([length, 0.012, 0.018], [x, 0.108, z], goldMaterial);
    });
    const activityLed = addBoardBox([0.055, 0.035, 0.055], [0.84, 0.13, 0.48], new THREE.MeshStandardMaterial({ color: 0x76ff9b, emissive: 0x41e66c, emissiveIntensity: 2 }));
    activityLed.rotation.y = 0.2;

    const chipLabelCanvas = document.createElement("canvas");
    chipLabelCanvas.width = 512;
    chipLabelCanvas.height = 160;
    const chipLabelContext = chipLabelCanvas.getContext("2d");
    if (chipLabelContext) {
      chipLabelContext.fillStyle = "#111418";
      chipLabelContext.fillRect(0, 0, 512, 160);
      chipLabelContext.fillStyle = "#f5f7f7";
      chipLabelContext.font = "700 64px Arial";
      chipLabelContext.textAlign = "center";
      chipLabelContext.fillText("RISC-V", 256, 79);
      chipLabelContext.fillStyle = "#80d5c1";
      chipLabelContext.font = "24px monospace";
      chipLabelContext.fillText("LINUX DEV BOARD", 256, 126);
    }
    const chipLabel = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.12), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(chipLabelCanvas) }));
    chipLabel.rotation.x = -Math.PI / 2;
    chipLabel.position.set(-0.16, 0.27, -0.03);
    chip.add(chipLabel);
    chip.position.set(-2.5, 0.28, 0);
    chip.rotation.set(-0.08, -0.3, 0);
    markInteractive(chip, "riscv");
    scene.add(chip);
    sceneObjects.set("riscv", chip);

    const terminal = new THREE.Group();
    terminal.position.set(0, 0.28, 0.1);
    markInteractive(terminal, "terminal");
    scene.add(terminal);
    sceneObjects.set("terminal", terminal);

    const portal = new THREE.Group();
    const portalGlow = new THREE.PointLight(0xa973ff, 2.2, 3.8, 1.6);
    portalGlow.position.set(0, 1.05, 0.35);
    portal.add(portalGlow);
    const particlePositions = new Float32Array(36 * 3);
    for (let index = 0; index < 36; index += 1) {
      particlePositions[index * 3] = (index % 6 - 2.5) * 0.035;
      particlePositions[index * 3 + 1] = 0.18 + ((index * 0.173) % 1) * 2.1;
      particlePositions[index * 3 + 2] = ((index * 0.379) % 1 - 0.5) * 1.45;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({ color: 0xd8b7ff, size: 0.045, transparent: true, opacity: 0, depthWrite: false });
    const portalParticles = new THREE.Points(particleGeometry, particleMaterial);
    portal.add(portalParticles);
    portal.position.set(2.55, 0.28, 0);
    portal.rotation.y = -Math.PI / 2;
    markInteractive(portal, "portal");
    scene.add(portal);
    sceneObjects.set("portal", portal);

    const shark = new THREE.Group();
    shark.position.set(0, 0.28, 2.45);
    shark.rotation.y = 1.08;
    scene.add(shark);
    sceneObjects.set("shark", shark);

    let sceneDisposed = false;
    const modelLoader = new GLTFLoader();
    const attachModel = (container: THREE.Group, id: SceneObject, url: string, targetSize: number) => {
      modelLoader.load(url, (gltf) => {
        if (sceneDisposed) return;
        const model = gltf.scene;
        model.traverse((object) => {
          object.userData.sceneObject = id;
          if (!(object instanceof THREE.Mesh)) return;
          object.castShadow = qualityRef.current === "balanced";
          object.receiveShadow = qualityRef.current === "balanced";
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            if (material instanceof THREE.MeshStandardMaterial && material.map) material.map.anisotropy = 2;
          });
        });
        const sourceBounds = new THREE.Box3().setFromObject(model);
        const sourceSize = sourceBounds.getSize(new THREE.Vector3());
        const maxDimension = Math.max(sourceSize.x, sourceSize.y, sourceSize.z);
        if (maxDimension > 0) model.scale.setScalar(targetSize / maxDimension);
        const fittedBounds = new THREE.Box3().setFromObject(model);
        const fittedCenter = fittedBounds.getCenter(new THREE.Vector3());
        model.position.set(-fittedCenter.x, -fittedBounds.min.y, -fittedCenter.z);
        container.add(model);
      }, undefined, () => {
        if (!sceneDisposed) setWebglError("A scene model could not be loaded.");
      });
    };

    attachModel(terminal, "terminal", "/models/terminal-real.glb", 2.15);
    attachModel(portal, "portal", "/models/portal-real.glb", 2.45);
    modelLoader.load("/models/blahaj-optimized.glb", (gltf) => {
      if (sceneDisposed) return;
      const sharkModel = gltf.scene;
      sharkModel.traverse((object) => {
        object.userData.sceneObject = "shark";
        if (!(object instanceof THREE.Mesh)) return;
        object.castShadow = qualityRef.current === "balanced";
        object.receiveShadow = qualityRef.current === "balanced";
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((entry) => {
          if (entry instanceof THREE.MeshStandardMaterial && entry.map) entry.map.anisotropy = 2;
        });
      });
      const sourceBounds = new THREE.Box3().setFromObject(sharkModel);
      const sourceSize = sourceBounds.getSize(new THREE.Vector3());
      const modelScale = 2.75 / Math.max(sourceSize.x, sourceSize.y, sourceSize.z);
      sharkModel.scale.setScalar(modelScale);
      const fittedBounds = new THREE.Box3().setFromObject(sharkModel);
      const fittedCenter = fittedBounds.getCenter(new THREE.Vector3());
      sharkModel.position.set(-fittedCenter.x, -fittedBounds.min.y, -fittedCenter.z);
      shark.add(sharkModel);
    }, undefined, () => {
      if (!sceneDisposed) setWebglError("BLÅHAJ model could not be loaded.");
    });
    markInteractive(shark, "shark");

    const remember = (id: SceneObject, object: THREE.Object3D) => originalTransforms.set(id, { position: object.position.clone(), rotation: object.rotation.clone(), scale: object.scale.clone() });
    remember("riscv", chip); remember("terminal", terminal); remember("portal", portal); remember("shark", shark); remember("stage", stage); remember("light", keyLight); remember("mirror", mirror);

    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.setMode("translate");
    transformControls.setSize(0.76);
    transformControls.attach(chip);
    transformControls.addEventListener("dragging-changed", (event) => {
      gizmoDraggingRef.current = Boolean(event.value);
      if (!event.value) syncInspector();
    });
    scene.add(transformControls.getHelper());
    controlsRef.current = transformControls;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const hitObject = (event: PointerEvent | MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(Array.from(sceneObjects.values()).filter((object) => object.visible), true)[0]?.object;
      return hit?.userData.sceneObject as SceneObject | undefined;
    };

    let dragging = false;
    let moved = false;
    let dragButton = 0;
    let lastX = 0;
    let lastY = 0;
    const onPointerDown = (event: PointerEvent) => {
      if (transformControls.axis) return;
      setContextMenu(null);
      dragging = true; moved = false; dragButton = event.button; lastX = event.clientX; lastY = event.clientY;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging || gizmoDraggingRef.current) return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
      if (dragButton === 1) {
        const forward = camera.getWorldDirection(new THREE.Vector3());
        const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
        const up = new THREE.Vector3().crossVectors(right, forward).normalize();
        const speed = orbitRef.current.radius * 0.0015;
        orbitRef.current.target.addScaledVector(right, -dx * speed).addScaledVector(up, dy * speed);
      } else {
        orbitRef.current.theta -= dx * 0.006;
        orbitRef.current.phi = THREE.MathUtils.clamp(orbitRef.current.phi + dy * 0.006, 0.25, Math.PI - 0.2);
      }
      lastX = event.clientX; lastY = event.clientY; updateCamera();
    };
    const onPointerUp = (event: PointerEvent) => {
      dragging = false;
      if (event.button === 0 && !moved && !gizmoDraggingRef.current) {
        const id = hitObject(event);
        if (id) selectObject(id);
      }
    };
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      orbitRef.current.radius = THREE.MathUtils.clamp(orbitRef.current.radius + event.deltaY * 0.007, 3.2, 20);
      updateCamera();
    };
    const onContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      if (moved) return;
      const id = hitObject(event);
      if (id) selectObject(id);
      setContextMenu({ x: Math.min(event.clientX, window.innerWidth - 230), y: Math.min(event.clientY, window.innerHeight - 160), kind: "viewport", objectId: id });
    };
    const onDragOver = (event: DragEvent) => {
      if (event.dataTransfer?.types.includes("application/x-lee-unity-model")) {
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
      }
    };
    const onDrop = (event: DragEvent) => {
      event.preventDefault();
      const sourceId = event.dataTransfer?.getData("application/x-lee-unity-model") as SceneObject | undefined;
      const source = sourceId ? sceneObjects.get(sourceId) : null;
      if (!source || !sourceId) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const point = new THREE.Vector3();
      if (!raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.28), point)) return;
      const id = `copy-${sourceId}-${Date.now()}` as SceneObject;
      const clone = source.clone(true);
      clone.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        child.geometry = child.geometry.clone();
        child.material = Array.isArray(child.material) ? child.material.map((material) => material.clone()) : child.material.clone();
      });
      clone.position.set(point.x, 0.28, point.z);
      clone.rotation.copy(source.rotation);
      markInteractive(clone, id);
      scene.add(clone);
      sceneObjects.set(id, clone);
      originalTransforms.set(id, { position: clone.position.clone(), rotation: clone.rotation.clone(), scale: clone.scale.clone() });
      setSceneObjectIds((ids) => [...ids, id]);
      setMotionSettings((settings) => ({
        ...settings,
        [id]: { ...(settings[sourceId] ?? defaultMotionConfig(sourceId)), enabled: false },
      }));
      setCustomLabels((labels) => ({ ...labels, [id]: `${labels[sourceId] ?? sourceId} Copy` }));
      selectObject(id);
      logAction(`Instantiated ${sourceId}`);
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    const onPointerLeave = () => { dragging = false; };
    renderer.domElement.addEventListener("pointerleave", onPointerLeave);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
    renderer.domElement.addEventListener("contextmenu", onContextMenu);
    renderer.domElement.addEventListener("dragover", onDragOver);
    renderer.domElement.addEventListener("drop", onDrop);

    const resize = () => {
      const width = host.clientWidth;
      const height = Math.max(host.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    let previousFrameTime = performance.now();
    let frame = 0;
    const motionWave = (cycle: number, easing: MotionEasing) => {
      const sine = Math.sin(cycle * Math.PI * 2);
      if (easing === "linear") return 1 - 4 * Math.abs(Math.round(cycle) - cycle);
      if (easing === "easeOut") return Math.sign(sine) * Math.sqrt(Math.abs(sine));
      if (easing === "bounce") return Math.abs(sine) * 2 - 1;
      return sine;
    };
    const restoreAnimatedObject = (id: SceneObject) => {
      if (!animatedObjects.has(id)) return;
      const object = sceneObjects.get(id);
      const base = motionBaseTransforms.get(id);
      if (object && base) {
        object.position.copy(base.position);
        object.rotation.copy(base.rotation);
        object.scale.copy(base.scale);
      }
      animatedObjects.delete(id);
      motionBaseTransforms.delete(id);
    };
    const animate = (timestamp = performance.now()) => {
      frame = requestAnimationFrame(animate);
      const delta = Math.min(Math.max((timestamp - previousFrameTime) / 1000, 0), 0.1);
      previousFrameTime = timestamp;
      if (playbackStateRef.current === "playing") {
        motionTimeRef.current += delta;
        const uiTick = Math.floor(motionTimeRef.current * 10);
        if (uiTick !== lastMotionUiUpdateRef.current) {
          lastMotionUiUpdateRef.current = uiTick;
          setMotionTime(motionTimeRef.current);
        }
      }
      const elapsed = motionTimeRef.current;
      let portalPhase: number | null = null;
      let portalAmount = 0;
      let riscvPhase: number | null = null;

      Object.entries(motionSettingsRef.current).forEach(([rawId, config]) => {
        const id = rawId as SceneObject;
        const object = sceneObjects.get(id);
        const active = Boolean(object?.visible && playbackStateRef.current !== "stopped" && config.enabled);
        if (!object || !active) {
          restoreAnimatedObject(id);
          return;
        }
        if (!animatedObjects.has(id)) {
          motionBaseTransforms.set(id, {
            position: object.position.clone(),
            rotation: object.rotation.clone(),
            scale: object.scale.clone(),
          });
          animatedObjects.add(id);
        }
        const base = motionBaseTransforms.get(id);
        if (!base) return;
        const rawCycle = elapsed * config.speed / (Math.PI * 2) + config.phase;
        const cycle = config.loop ? ((rawCycle % 1) + 1) % 1 : THREE.MathUtils.clamp(rawCycle, 0, 1);
        const phase = cycle * Math.PI * 2;
        const wave = motionWave(cycle, config.easing);
        object.position.copy(base.position);
        object.rotation.copy(base.rotation);
        object.scale.copy(base.scale);

        if (config.mode === "float") {
          object.position[config.axis] += wave * config.amount;
        } else if (config.mode === "rotate") {
          object.rotation[config.axis] += (config.loop ? rawCycle : cycle) * Math.PI * 2 * config.amount;
        } else if (config.mode === "orbit") {
          const cosine = Math.cos(phase) * config.amount;
          const sine = Math.sin(phase) * config.amount;
          if (config.axis === "x") { object.position.y += cosine; object.position.z += sine; }
          if (config.axis === "y") { object.position.x += cosine; object.position.z += sine; }
          if (config.axis === "z") { object.position.x += cosine; object.position.y += sine; }
        } else if (config.mode === "sway") {
          object.rotation[config.axis] += wave * config.amount;
        } else if (config.mode === "bounce") {
          object.position[config.axis] += Math.abs(wave) * config.amount;
        } else if (config.mode === "pulse") {
          object.scale.multiplyScalar(Math.max(0.1, 1 + wave * config.amount));
        }

        if (id === "portal") { portalPhase = phase; portalAmount = config.amount; }
        if (id === "riscv") riscvPhase = phase;
      });

      if (portalPhase !== null) {
        portalGlow.intensity = 2.1 + Math.sin(portalPhase * 2.2) * THREE.MathUtils.clamp(portalAmount * 4, 0.2, 1.6);
        particleMaterial.opacity = qualityRef.current === "balanced" ? 0.82 : 0.48;
        const positions = particleGeometry.getAttribute("position") as THREE.BufferAttribute;
        for (let index = 0; index < positions.count; index += 1) {
          positions.setY(index, 0.18 + ((index * 0.173 + portalPhase * 0.08) % 1) * 2.1);
        }
        positions.needsUpdate = true;
      } else {
        portalGlow.intensity = 1.9;
        particleMaterial.opacity = 0;
      }
      (activityLed.material as THREE.MeshStandardMaterial).emissiveIntensity = riscvPhase === null
        ? 1.6
        : 1.8 + Math.sin(riscvPhase * 3.1) * 0.7;
      renderer.render(scene, camera);
    };
    animate(previousFrameTime);

    return () => {
      sceneDisposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      transformControls.dispose();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
      renderer.domElement.removeEventListener("wheel", onWheel);
      renderer.domElement.removeEventListener("contextmenu", onContextMenu);
      renderer.domElement.removeEventListener("dragover", onDragOver);
      renderer.domElement.removeEventListener("drop", onDrop);
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      });
      renderer.dispose();
      mirrorReflector.getRenderTarget().dispose();
      renderer.domElement.remove();
      sceneRef.current = null;
      sceneObjects.clear();
      originalTransforms.clear();
      motionBaseTransforms.clear();
      animatedObjects.clear();
      keyLightRef.current = null;
      detailLightsRef.current = [];
      mirrorReflectorRef.current = null;
      mirrorFallbackRef.current = null;
    };
  }, [frameSelected, logAction, selectObject, syncInspector, updateCamera]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, [contenteditable='true']")) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === "s") {
        event.preventDefault();
        saveScene();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === "o") {
        event.preventDefault();
        loadScene();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === "d") {
        event.preventDefault();
        duplicateSelected();
        return;
      }
      if (event.key === "w" || event.key === "W") setToolMode("translate");
      if (event.key === "e" || event.key === "E") setToolMode("rotate");
      if (event.key === "r" || event.key === "R") setToolMode("scale");
      if (event.key === "g" || event.key === "G") setGridVisible((value) => !value);
      if (event.key === "f" || event.key === "F") frameSelected();
      if (event.key === "F2") {
        event.preventDefault();
        objectNameInputRef.current?.focus();
        objectNameInputRef.current?.select();
      }
      if (event.key === "Delete") deleteSelected();
      if (event.key === " ") {
        event.preventDefault();
        toggleMotionPlayback();
      }
      if (event.key === "Escape") {
        if (panelFullscreen) exitAssetFullscreen();
        else closeAssetPanel();
        setActiveMenu(null);
        setContextMenu(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeAssetPanel, deleteSelected, duplicateSelected, exitAssetFullscreen, frameSelected, loadScene, panelFullscreen, saveScene, toggleMotionPlayback]);

  useEffect(() => { controlsRef.current?.setMode(toolMode); }, [toolMode]);
  useEffect(() => { controlsRef.current?.setSpace(toolSpace); }, [toolSpace]);
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.setTranslationSnap(snapEnabled ? snapValue : null);
    controls.setRotationSnap(snapEnabled ? THREE.MathUtils.degToRad(15) : null);
    controls.setScaleSnap(snapEnabled ? snapValue : null);
  }, [snapEnabled, snapValue]);
  useEffect(() => {
    const helper = controlsRef.current?.getHelper();
    if (helper) helper.visible = gizmosVisible;
  }, [gizmosVisible]);
  useEffect(() => { if (gridRef.current) gridRef.current.visible = gridVisible; }, [gridVisible]);
  useEffect(() => {
    qualityRef.current = quality;
    const renderer = rendererRef.current;
    const host = viewportRef.current;
    if (!renderer || !host) return;
    const balanced = quality === "balanced";
    renderer.setPixelRatio(balanced ? Math.min(window.devicePixelRatio, 1.5) : 1);
    renderer.shadowMap.enabled = balanced;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMappingExposure = balanced ? 1.08 : 1;
    if (keyLightRef.current) keyLightRef.current.castShadow = balanced;
    detailLightsRef.current.forEach((light) => { light.visible = balanced; });
    if (mirrorReflectorRef.current) mirrorReflectorRef.current.visible = balanced;
    if (mirrorFallbackRef.current) mirrorFallbackRef.current.visible = !balanced;
    sceneRef.current?.traverse((object) => {
      if (!(object instanceof THREE.Mesh) || object === mirrorReflectorRef.current || object === mirrorFallbackRef.current) return;
      object.castShadow = balanced;
      object.receiveShadow = balanced;
    });
    renderer.setSize(host.clientWidth, host.clientHeight, false);
  }, [quality]);
  useEffect(() => {
    objectsRef.current.forEach((object) => object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => { material.wireframe = wireframe; material.needsUpdate = true; });
    }));
  }, [wireframe]);

  const transformValue = (kind: "position" | "rotation" | "scale", axis: "x" | "y" | "z") => inspector[kind][axis === "x" ? 0 : axis === "y" ? 1 : 2];
  const updateTransform = (kind: "position" | "rotation" | "scale", axis: "x" | "y" | "z", value: number) => {
    const object = objectsRef.current.get(selectedRef.current);
    if (!object || Number.isNaN(value)) return;
    object[kind][axis] = kind === "rotation" ? THREE.MathUtils.degToRad(value) : value;
    syncInspector();
  };
  const toggleSelectedVisibility = () => {
    const object = objectsRef.current.get(selectedRef.current);
    if (!object) return;
    object.visible = !object.visible;
    syncInspector();
  };
  const updateUniformScale = (value: number) => {
    const object = objectsRef.current.get(selectedRef.current);
    if (!object) return;
    object.scale.setScalar(value);
    syncInspector();
  };
  const updateLightIntensity = (value: number) => {
    const object = objectsRef.current.get(selectedRef.current);
    if (!object) return;
    object.traverse((child) => {
      if (child instanceof THREE.Light) child.intensity = value;
    });
    syncInspector();
  };

  const menuDefinitions = [
    [
      { id: "save", label: `${t.commands.save}　Ctrl+S` },
      { id: "load", label: `${t.commands.load}　Ctrl+O` },
      { id: "blog", label: t.commands.blog },
      { id: "profile", label: t.commands.profile },
    ],
    [
      { id: "frame", label: `${t.commands.frame}　F` },
      { id: "reset", label: t.commands.reset },
      { id: "duplicate", label: `${t.commands.duplicate}　Ctrl+D` },
      { id: "delete", label: `${t.commands.delete}　Del` },
      { id: "toggle", label: t.commands.toggle },
    ],
    [
      { id: "source", label: locale === "zh" ? "打开源码" : locale === "ja" ? "ソースを開く" : "Open Source" },
      { id: "content", label: t.commands.blog },
    ],
    [
      { id: "cube", label: t.commands.cube },
      { id: "sphere", label: t.commands.sphere },
      { id: "cylinder", label: t.commands.cylinder },
      { id: "plane", label: t.commands.plane },
      { id: "duplicate", label: t.commands.duplicate },
      { id: "toggle", label: `${t.commands.toggle}　${objectLabel(selected)}` },
      { id: "open-selected", label: t.commands.frame },
    ],
    [
      { id: "grid", label: `${t.commands.grid}　G` },
      { id: "wire", label: t.commands.wire },
      { id: "reset", label: t.commands.reset },
    ],
    [
      { id: "project", label: t.commands.project },
      { id: "console", label: t.commands.console },
      { id: "animation", label: locale === "zh" ? "动画" : locale === "ja" ? "アニメーション" : "Animation" },
      { id: "inspector", label: t.inspector },
      { id: "toggle-left", label: `${leftPanelVisible ? "✓" : "　"} ${t.hierarchy}` },
      { id: "toggle-right", label: `${rightPanelVisible ? "✓" : "　"} ${t.inspector}` },
      { id: "toggle-bottom", label: `${bottomPanelVisible ? "✓" : "　"} ${t.project}` },
    ],
  ];

  const runMenuCommand = (id: string) => {
    if (id === "save") saveScene();
    if (id === "load") loadScene();
    if (id === "blog") { setArticleDocument(null); setShowAllBlog(true); setAssetPanel("blog"); }
    if (id === "profile") { setArticleDocument(null); setAssetPanel("profile"); }
    if (id === "frame") frameSelected();
    if (id === "reset") resetSelected();
    if (id === "duplicate") duplicateSelected();
    if (id === "delete") deleteSelected();
    if (id === "toggle") toggleSelected();
    if (id === "source") { setBottomPanelVisible(true); setProjectTab("project"); setProjectFolder("Source"); }
    if (id === "content") { setProjectTab("project"); setProjectFolder("Content"); }
    if (id === "open-selected") {
      frameSelected();
    }
    if (id === "grid") setGridVisible((value) => !value);
    if (id === "wire") setWireframe((value) => !value);
    if (id === "cube" || id === "sphere" || id === "cylinder" || id === "plane") createSceneObject(id);
    if (id === "project") { setBottomPanelVisible(true); setProjectTab("project"); }
    if (id === "console") { setBottomPanelVisible(true); setProjectTab("console"); }
    if (id === "animation") { setBottomPanelVisible(true); setProjectTab("animation"); }
    if (id === "inspector") { setRightPanelVisible(true); logAction(`${t.inspector}: ${objectLabel(selected)}`); }
    if (id === "toggle-left") setLeftPanelVisible((value) => !value);
    if (id === "toggle-right") setRightPanelVisible((value) => !value);
    if (id === "toggle-bottom") setBottomPanelVisible((value) => !value);
    setActiveMenu(null);
  };

  const selectedContextAsset = contextMenu?.assetId ? projectAssets.find((asset) => asset.id === contextMenu.assetId) : null;
  const copyAssetPath = async (asset: VirtualAsset) => {
    try {
      await navigator.clipboard.writeText(asset.path);
      logAction(t.commands.copied);
    } catch {
      logAction(asset.path);
    }
    setContextMenu(null);
  };

  const renderContextMenu = () => {
    if (!contextMenu) return null;
    return <div
      className={styles.contextMenu}
      style={{ left: contextMenu.x, top: contextMenu.y }}
      onPointerDown={(event) => event.stopPropagation()}
      role="menu"
    >
      {contextMenu.kind === "viewport" ? <>
        <button onClick={() => { frameSelected(); setContextMenu(null); }}>{t.commands.frame}<kbd>F</kbd></button>
        <button onClick={() => { duplicateSelected(); setContextMenu(null); }}>{t.commands.duplicate}<kbd>Ctrl+D</kbd></button>
        <button onClick={() => { resetSelected(); setContextMenu(null); }}>{t.commands.reset}</button>
        <button onClick={() => { setBottomPanelVisible(true); setProjectTab("animation"); setContextMenu(null); }}>{locale === "zh" ? "编辑动画" : locale === "ja" ? "アニメーション編集" : "Edit Animation"}</button>
        <button onClick={() => { toggleSelected(); setContextMenu(null); }}>{t.commands.toggle}</button>
        <button onClick={() => { deleteSelected(); setContextMenu(null); }}>{t.commands.delete}<kbd>Del</kbd></button>
        {!contextMenu.objectId && <><button onClick={() => { createSceneObject("cube"); setContextMenu(null); }}>{t.commands.cube}</button><button onClick={() => { createSceneObject("sphere"); setContextMenu(null); }}>{t.commands.sphere}</button></>}
      </> : selectedContextAsset && <>
        <button onClick={() => { openProjectAsset(selectedContextAsset); setContextMenu(null); }}>{t.commands.open}</button>
        <button onClick={() => copyAssetPath(selectedContextAsset)}>{t.commands.copyPath}</button>
        <button onClick={() => { setSelectedAsset(selectedContextAsset.id); logAction(selectedContextAsset.path); setContextMenu(null); }}>{t.commands.reveal}</button>
      </>}
    </div>;
  };

  const renderAssetPanel = () => {
    if (!assetPanel) return null;
    const fullscreenLabel = locale === "zh" ? (panelFullscreen ? "退出全屏" : "全屏") : locale === "ja" ? (panelFullscreen ? "全画面を終了" : "全画面") : (panelFullscreen ? "Exit fullscreen" : "Fullscreen");
    const sharePanelLabel = panelShareState === "copied"
      ? (locale === "zh" ? "链接已复制" : locale === "ja" ? "コピー済み" : "Copied")
      : panelShareState === "failed"
        ? (locale === "zh" ? "复制失败" : locale === "ja" ? "コピー失敗" : "Copy failed")
        : (locale === "zh" ? "复制分享链接" : locale === "ja" ? "共有リンクをコピー" : "Copy share link");
    return <section className={`${styles.assetPanel} ${panelExpanded ? styles.assetPanelExpanded : ""} ${panelFullscreen ? styles.assetPanelFullscreen : ""}`} aria-label={assetPanel}>
      <header><span>{articleDocument?.title ?? (assetPanel === "blog" ? t.blogAsset : assetPanel === "profile" ? t.profileAsset : assetPanel === "friends" ? t.friendsAsset : t.socialAsset)}</span><div><button className={styles.panelShareButton} type="button" onClick={copyPanelShareLink} aria-label={sharePanelLabel} title={sharePanelLabel}>⧉ {sharePanelLabel}</button><button onClick={() => setPanelExpanded((value) => !value)} aria-label={panelExpanded ? "Restore" : "Maximize"} disabled={panelFullscreen}>{panelExpanded ? "❐" : "□"}</button><button className={styles.fullscreenButton} onClick={toggleAssetFullscreen} aria-label={fullscreenLabel} title={fullscreenLabel}>{panelFullscreen ? "↙" : "⛶"}</button><button onClick={closeAssetPanel} aria-label="Close">×</button></div></header>
      {assetPanel === "blog" && <div className={styles.blogAsset} ref={assetPanelBodyRef}>
        {articleDocument ? <div className={styles.articlePreview}>
          <button className={styles.previewBack} onClick={() => { if (assetPanelBodyRef.current) assetPanelBodyRef.current.scrollTop = 0; setArticleDocument(null); }}>← {t.blogAsset}</button>
          <div className={styles.previewMeta}><span>{articleDocument.number}</span><span>{articleDocument.category}</span><span>{articleDocument.displayDate}</span><span>{articleDocument.readingMinutes} MIN</span></div>
          <h2>{articleDocument.title}</h2>
          <p>{articleDocument.description}</p>
          <article dangerouslySetInnerHTML={{ __html: articleDocument.html }} />
        </div> : <>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.blogSearch} />
          {articleLoading && <div className={styles.previewLoading}>Loading article…</div>}
          <div className={styles.blogList}>{filteredArticles.map((article) => <button type="button" onClick={() => void openArticlePreview(article)} key={article.href}><span>{article.number}</span><div><small>{article.category} / {article.language.toUpperCase()}</small><strong>{article.title}</strong></div><time>{article.displayDate}</time></button>)}</div>
          <button className={styles.openAsset} onClick={() => { setShowAllBlog((value) => !value); setPanelExpanded(true); }}>{showAllBlog ? "显示最新五篇" : t.openBlog}</button>
        </>}
      </div>}
      {assetPanel === "profile" && <div className={styles.profileAsset} ref={assetPanelBodyRef}>
        <span>{t.profileKicker}</span><h2>{t.profileTitle}</h2><p>{t.profileText}</p>
        <dl><div><dt>{t.focus}</dt><dd>RISC-V / Linux / LLVM</dd></div><div><dt>{t.now}</dt><dd>openRuyi Linux</dd></div><div><dt>{t.values}</dt><dd>openRuyi / Project Trans / 开往</dd></div></dl>
        {panelExpanded && <div className={styles.profileDetails}>
          <h3>{locale === "zh" ? "项目经历" : locale === "ja" ? "プロジェクト経験" : "Project experience"}</h3>
          <div className={styles.profileProjectList}>{profileProjects.map((project) => <article key={project.period}>
            <p><time>{project.period}</time><span>{project.organization[locale]}</span></p>
            <h4>{project.title[locale]}</h4>
            <ul>{project.points[locale].map((point) => <li key={point}>{point}</li>)}</ul>
          </article>)}</div>
          <h3>{locale === "zh" ? "开源社区" : locale === "ja" ? "オープンソースコミュニティ" : "Open-source communities"}</h3>
          <div className={styles.profileCommunityList}>{profileCommunities.map((community) => <p key={community.name}><strong>{community.name}</strong><span>{community.role[locale]}</span></p>)}</div>
          <h3>{locale === "zh" ? "常用技术" : locale === "ja" ? "主な技術" : "Toolbox"}</h3>
          <p>C / C++ / TypeScript / Python / Linux / RISC-V / LLVM / React / Vue / Electron / Jenkins / GitHub Actions / Docker / Nginx</p>
        </div>}
        <button className={styles.openAsset} onClick={() => setPanelExpanded((value) => !value)}>{panelExpanded ? "收起" : t.openResume}</button>
      </div>}
      {assetPanel === "friends" && <div className={styles.friendsAsset} ref={assetPanelBodyRef}>
        {friends.map((friend) => <a href={friend.href} target="_blank" rel="noreferrer" key={friend.name}><Image src={friend.avatar} alt="" width={48} height={48} unoptimized /><span><strong>{friend.name}</strong><small>{friend.description[locale]}</small></span><b>↗</b></a>)}
      </div>}
      {assetPanel === "social" && <div className={styles.socialAsset} ref={assetPanelBodyRef}>
        <div className={styles.socialIntro}><span>BLÅHAJ / LINKS</span><h2>{t.socialTitle}</h2><p>{t.socialText}</p></div>
        <div className={styles.socialGrid}>{personalLinks.map((link) => <a href={link.href} target="_blank" rel="noreferrer" key={link.label}><i>{link.monogram}</i><span><strong>{link.label}</strong><small>{link.detail}</small></span><b>↗</b></a>)}</div>
      </div>}
    </section>;
  };

  return <main
    className={styles.unityShell}
    style={{
      "--left-panel-width": `${leftPanelVisible ? leftPanelWidth : 0}px`,
      "--right-panel-width": `${rightPanelVisible ? rightPanelWidth : 0}px`,
      "--bottom-panel-height": `${bottomPanelVisible ? bottomPanelHeight : 0}px`,
    } as CSSProperties}
  >
    <header className={styles.menuBar}>
      <button className={styles.unityBrand} onClick={resetCamera}>LEE<span>UNITY</span></button>
      <nav>{t.menus.map((menu, index) => <div className={styles.menuItem} key={menu} onPointerDown={(event) => event.stopPropagation()}>
        <button className={activeMenu === index ? styles.menuActive : ""} onClick={() => setActiveMenu((value) => value === index ? null : index)}>{menu}</button>
        {activeMenu === index && <div className={styles.menuDropdown} role="menu">{menuDefinitions[index].map((item) => <button key={item.id} onClick={() => runMenuCommand(item.id)}>{item.label}</button>)}</div>}
      </div>)}</nav>
      <select className={styles.languageSelect} value={locale} onChange={(event) => chooseLocale(event.target.value as Locale)} aria-label="Language">
        {(Object.keys(messages) as Locale[]).map((language) => <option value={language} key={language}>{messages[language].lang}</option>)}
      </select>
      <a href="https://github.com/Leetfs/website" target="_blank" rel="noreferrer">{t.exit}</a>
    </header>

    <div className={styles.toolBar}>
      <div className={styles.transformTools}>
        <button className={toolMode === "translate" ? styles.toolActive : ""} onClick={() => setToolMode("translate")} title="Move (W)">↔</button>
        <button className={toolMode === "rotate" ? styles.toolActive : ""} onClick={() => setToolMode("rotate")} title="Rotate (E)">⟳</button>
        <button className={toolMode === "scale" ? styles.toolActive : ""} onClick={() => setToolMode("scale")} title="Scale (R)">↗</button>
        <button onClick={frameSelected} title="Frame selected (F)">◎</button><button onClick={resetCamera} title="Reset camera">⌂</button>
        <button onClick={() => setCameraView("front")} title="Front view">F</button><button onClick={() => setCameraView("right")} title="Right view">R</button><button onClick={() => setCameraView("top")} title="Top view">T</button>
      </div>
      <div className={styles.playTools}>
        <button className={playModeActive ? styles.playActive : ""} onClick={toggleMotionPlayback} title={playing ? "Pause" : "Play"} aria-pressed={playModeActive}>▶</button><button className={playbackState === "paused" ? styles.toolActive : ""} onClick={pauseMotion} title="Pause and hold current frame">Ⅱ</button><button onClick={stopMotion} title="Stop and restore transforms">■</button>
      </div>
      <div className={styles.viewTools}>
        <button className={toolSpace === "local" ? styles.toolActive : ""} onClick={() => setToolSpace((space) => space === "local" ? "world" : "local")} title="Handle orientation">{toolSpace === "local" ? "Local" : "Global"}</button>
        <button className={snapEnabled ? styles.toolActive : ""} onClick={() => setSnapEnabled((value) => !value)} title={`Grid snapping: ${snapValue}`}>⌁ {snapValue}</button>
        <button className={gizmosVisible ? styles.toolActive : ""} onClick={() => setGizmosVisible((value) => !value)} title="Toggle transform gizmo">Gizmos</button>
        <button className={gridVisible ? styles.toolActive : ""} onClick={() => setGridVisible((value) => !value)}>{t.grid}</button>
        <button className={wireframe ? styles.toolActive : ""} onClick={() => setWireframe((value) => !value)}>{t.wire}</button>
        <button onClick={() => setQuality((value) => value === "lite" ? "balanced" : "lite")}>{t.render}: {quality === "lite" ? t.lite : t.balanced}</button>
        <span className={styles.layoutTools} aria-label="Layout controls">
          <button className={leftPanelVisible ? styles.layoutActive : ""} onClick={() => setLeftPanelVisible((value) => !value)} title={t.hierarchy} aria-pressed={leftPanelVisible}><span className={`${styles.layoutGlyph} ${styles.layoutLeft}`} /></button>
          <button onClick={() => { setLeftPanelVisible(true); setRightPanelVisible(true); setBottomPanelVisible(true); setLeftPanelWidth(250); setRightPanelWidth(320); setBottomPanelHeight(210); }} title={locale === "zh" ? "恢复默认布局" : locale === "ja" ? "既定のレイアウトに戻す" : "Restore default layout"}><span className={`${styles.layoutGlyph} ${styles.layoutAll}`}><i /><i /><i /></span></button>
          <button className={bottomPanelVisible ? styles.layoutActive : ""} onClick={() => setBottomPanelVisible((value) => !value)} title={t.project} aria-pressed={bottomPanelVisible}><span className={`${styles.layoutGlyph} ${styles.layoutBottom}`} /></button>
          <button className={rightPanelVisible ? styles.layoutActive : ""} onClick={() => setRightPanelVisible((value) => !value)} title={t.inspector} aria-pressed={rightPanelVisible}><span className={`${styles.layoutGlyph} ${styles.layoutRight}`} /></button>
        </span>
      </div>
    </div>

    {leftPanelVisible && <aside className={styles.hierarchyPanel}>
      <header><strong>{t.hierarchy}</strong><div className={styles.hierarchyActions}>
        <div className={styles.createMenuHost} onPointerDown={(event) => event.stopPropagation()}>
          <button className={createMenuOpen ? styles.createButtonActive : ""} onClick={() => setCreateMenuOpen((value) => !value)} title={createLabels[locale].title} aria-label={createLabels[locale].title} aria-haspopup="menu" aria-expanded={createMenuOpen}>＋</button>
          {createMenuOpen && <div className={styles.createMenu} role="menu" aria-label={createLabels[locale].title}>
            <div className={styles.createCategories}>
              <strong>{createLabels[locale].title}</strong>
              {createCatalog.map((category) => <button className={createMenuCategory === category.id ? styles.createCategoryActive : ""} onPointerEnter={() => setCreateMenuCategory(category.id)} onFocus={() => setCreateMenuCategory(category.id)} onClick={() => setCreateMenuCategory(category.id)} key={category.id}><i>{category.icon}</i><span>{createLabels[locale].categories[category.id]}</span><b>›</b></button>)}
            </div>
            <div className={styles.createSubmenu}>
              <strong>{createLabels[locale].categories[createMenuCategory]}</strong>
              {createCatalog.find((category) => category.id === createMenuCategory)?.items.map((item) => <button onClick={() => { createSceneObject(item.id); setCreateMenuOpen(false); }} key={item.id}><i>{item.icon}</i><span>{createLabels[locale].items[item.id]}</span></button>)}
            </div>
          </div>}
        </div>
        <button onClick={() => setLeftPanelVisible(false)} title="Hide">×</button>
      </div></header>
      <div className={styles.hierarchyTree}>
        <div className={styles.sceneRoot}>⌄　{t.sceneRoot}</div>
        {sceneObjectIds.map((id) => <button className={selected === id ? styles.selectedNode : ""} onClick={() => { selectObject(id); queueMicrotask(frameSelected); }} onContextMenu={(event) => { event.preventDefault(); selectObject(id); setContextMenu({ x: Math.min(event.clientX, window.innerWidth - 230), y: Math.min(event.clientY, window.innerHeight - 160), kind: "viewport", objectId: id }); }} key={id}><i>{id === "light" ? "☀" : id === "mirror" ? "▣" : id === "stage" ? "⬡" : id === "terminal" ? "▤" : id === "portal" ? "◯" : id === "shark" ? "≈" : id.startsWith("primitive") ? "◈" : "▦"}</i><span>{objectLabel(id)}</span></button>)}
      </div>
    </aside>}

    <section className={styles.scenePanel}>
      <header><button className={sceneView === "scene" ? styles.sceneTabActive : ""} onClick={() => setSceneView("scene")}>{t.scene}</button><button className={sceneView === "game" ? styles.sceneTabActive : ""} onClick={() => setSceneView("game")}>{t.game}</button><span>{sceneView === "scene" ? t.shaded : t.display}　▾</span></header>
      <div ref={viewportRef} className={styles.viewport} />
      {webglError && <div className={styles.webglError}>{webglError}</div>}
      <div className={styles.sceneHint}>{t.hint}</div>
      {sceneView === "game" && <div className={styles.gameBadge}>{t.gamePreview}　{playbackState === "playing" ? t.running : playbackState === "paused" ? "PAUSED" : "STOPPED"}</div>}
      {renderAssetPanel()}
    </section>

    {rightPanelVisible && <aside className={styles.inspectorPanel}>
      <header><strong>{t.inspector}</strong><div><button onClick={() => setRightPanelVisible(false)} title="Hide">×</button></div></header>
      <div className={styles.objectHeader}><button className={`${styles.visibilityToggle} ${inspector.visible ? styles.objectEnabled : ""}`} onClick={toggleSelectedVisibility}>✓</button><div><small>{t.gameObject} · F2</small><input ref={objectNameInputRef} className={styles.objectNameInput} value={objectLabel(selected)} onChange={(event) => setCustomLabels((labels) => ({ ...labels, [selected]: event.target.value }))} onBlur={(event) => { if (!event.target.value.trim()) setCustomLabels((labels) => { const next = { ...labels }; delete next[selected]; return next; }); }} aria-label={locale === "zh" ? "对象名称" : locale === "ja" ? "オブジェクト名" : "Object name"} /></div></div>
      <div className={styles.componentBlock}>
        <header><span>⌄　{t.transform}</span><button onClick={resetSelected}>↶</button></header>
        {(["position", "rotation", "scale"] as const).map((kind) => <div className={styles.vectorRow} key={kind}><label>{t[kind]}</label>{(["x", "y", "z"] as const).map((axis) => <span key={axis}><i>{axis.toUpperCase()}</i><input type="number" step={kind === "rotation" ? 5 : 0.1} value={transformValue(kind, axis)} onChange={(event) => updateTransform(kind, axis, Number(event.target.value))} /></span>)}</div>)}
      </div>
      <div className={styles.componentBlock}>
        <header><span>⌄　{t.meshRenderer}</span></header>
        <label className={styles.checkRow}><input type="checkbox" checked={inspector.visible} onChange={toggleSelectedVisibility} /><span>{t.enabled}</span></label>
        <label className={styles.checkRow}><input type="checkbox" checked={wireframe} onChange={() => setWireframe((value) => !value)} /><span>{t.wire}</span></label>
        <div className={styles.sliderRow}><span>{t.globalScale}</span><input type="range" min="0.35" max="1.8" step="0.05" value={inspector.scale[0]} onChange={(event) => updateUniformScale(Number(event.target.value))} /></div>
        <label className={styles.checkRow}><input type="checkbox" checked={snapEnabled} onChange={() => setSnapEnabled((value) => !value)} /><span>{locale === "zh" ? "启用吸附" : locale === "ja" ? "スナップ" : "Snapping"}</span></label>
        {snapEnabled && <div className={styles.sliderRow}><span>{locale === "zh" ? "移动步长" : locale === "ja" ? "移動間隔" : "Move snap"}　{snapValue.toFixed(2)}</span><input type="range" min="0.05" max="1" step="0.05" value={snapValue} onChange={(event) => setSnapValue(Number(event.target.value))} /></div>}
        {inspector.hasLight && <div className={styles.sliderRow}><span>{t.intensity}</span><input type="range" min="0" max="12" step="0.1" value={inspector.intensity} onChange={(event) => updateLightIntensity(Number(event.target.value))} /></div>}
      </div>
      {!inspector.hasLight && <div className={styles.componentBlock}>
        <header><span>⌄　{t.commands.material}</span></header>
        <label className={styles.materialRow}><span>Color</span><input type="color" value={inspector.color} onChange={(event) => updateMaterial("color", event.target.value)} /></label>
        <label className={styles.sliderRow}><span>Roughness</span><input type="range" min="0" max="1" step="0.02" value={inspector.roughness} onChange={(event) => updateMaterial("roughness", Number(event.target.value))} /></label>
        <label className={styles.sliderRow}><span>Metallic</span><input type="range" min="0" max="1" step="0.02" value={inspector.metalness} onChange={(event) => updateMaterial("metalness", Number(event.target.value))} /></label>
      </div>}
      <div className={styles.componentBlock}>
        <header><span>⌄　{locale === "zh" ? "动态效果" : locale === "ja" ? "アニメーション" : "Animation"}</span><button className={playModeActive ? styles.animationRunning : ""} onClick={toggleMotionPlayback} title={playing ? "Pause all motion" : "Play enabled motion"}>{playing ? "Ⅱ" : "▶"}</button></header>
        <label className={styles.checkRow}><input type="checkbox" checked={selectedMotion.enabled} onChange={(event) => updateSelectedMotion({ enabled: event.target.checked })} /><span>{locale === "zh" ? "启用所选对象动态" : locale === "ja" ? "選択中のオブジェクトで有効化" : "Enable for selected object"}</span></label>
        <label className={styles.selectRow}><span>{locale === "zh" ? "运动类型" : locale === "ja" ? "モーション" : "Motion"}</span><select value={selectedMotion.mode} onChange={(event) => updateSelectedMotion({ mode: event.target.value as MotionMode })}><option value="float">Float</option><option value="rotate">Rotate</option><option value="orbit">Orbit</option><option value="sway">Sway</option><option value="bounce">Bounce</option><option value="pulse">Pulse</option></select></label>
        <label className={styles.selectRow}><span>{locale === "zh" ? "作用轴" : locale === "ja" ? "軸" : "Axis"}</span><select value={selectedMotion.axis} onChange={(event) => updateSelectedMotion({ axis: event.target.value as MotionAxis })}><option value="x">X</option><option value="y">Y</option><option value="z">Z</option></select></label>
        <label className={styles.selectRow}><span>{locale === "zh" ? "缓动" : locale === "ja" ? "イージング" : "Easing"}</span><select value={selectedMotion.easing} onChange={(event) => updateSelectedMotion({ easing: event.target.value as MotionEasing })}><option value="linear">Linear</option><option value="easeInOut">Ease In Out</option><option value="easeOut">Ease Out</option><option value="bounce">Bounce</option></select></label>
        <label className={styles.checkRow}><input type="checkbox" checked={selectedMotion.loop} onChange={(event) => updateSelectedMotion({ loop: event.target.checked })} /><span>{locale === "zh" ? "循环播放" : locale === "ja" ? "ループ" : "Loop Time"}</span></label>
        <label className={styles.sliderRow}><span>{locale === "zh" ? "速度" : locale === "ja" ? "速度" : "Speed"}　{selectedMotion.speed.toFixed(2)}×</span><input type="range" min="0.25" max="2.5" step="0.05" value={selectedMotion.speed} onChange={(event) => updateSelectedMotion({ speed: Number(event.target.value) })} /></label>
        <label className={styles.sliderRow}><span>{locale === "zh" ? "幅度" : locale === "ja" ? "振幅" : "Amplitude"}　{selectedMotion.amount.toFixed(2)}</span><input type="range" min="0.04" max="0.4" step="0.01" value={selectedMotion.amount} onChange={(event) => updateSelectedMotion({ amount: Number(event.target.value) })} /></label>
        <label className={styles.sliderRow}><span>{locale === "zh" ? "相位" : locale === "ja" ? "位相" : "Phase"}　{selectedMotion.phase.toFixed(2)}</span><input type="range" min="0" max="1" step="0.01" value={selectedMotion.phase} onChange={(event) => updateSelectedMotion({ phase: Number(event.target.value) })} /></label>
        <p className={styles.animationHint}>{locale === "zh" ? `正在设置：${objectLabel(selected)}。顶部播放键会运行所有已启用对象。` : locale === "ja" ? `設定対象：${objectLabel(selected)}。上部の再生ボタンですべての有効な動きを実行します。` : `Editing: ${objectLabel(selected)}. The top Play button runs every enabled object.`}</p>
      </div>
    </aside>}

    {bottomPanelVisible && <section className={styles.projectPanel} id="project">
      <header><button className={projectTab === "project" ? styles.projectTabActive : ""} onClick={() => setProjectTab("project")}>{t.project}</button><button className={projectTab === "console" ? styles.projectTabActive : ""} onClick={() => setProjectTab("console")}>{t.console}</button><button className={projectTab === "animation" ? styles.projectTabActive : ""} onClick={() => setProjectTab("animation")}>{locale === "zh" ? "动画" : locale === "ja" ? "アニメーション" : "Animation"}</button>{activeSourceFile && <button className={projectTab === "code" ? styles.projectTabActive : ""} onClick={() => setProjectTab("code")}>{locale === "zh" ? "代码" : locale === "ja" ? "コード" : "Code"} · {activeSourceFile.name}</button>}<button className={styles.panelClose} onClick={() => setBottomPanelVisible(false)} title="Hide">×</button></header>
      <aside>{projectTab === "animation"
        ? sceneObjectIds.map((id) => <button className={selected === id ? styles.folderActive : ""} onClick={() => selectObject(id)} key={id}>{motionSettings[id]?.enabled ? "● " : "○ "}{objectLabel(id)}</button>)
        : projectTab === "code"
          ? sourceFiles.map((file) => <button className={openSourcePath === file.path ? styles.folderActive : ""} onClick={() => { setOpenSourcePath(file.path); setSourceSearch(""); }} title={file.path} key={file.path}>{openSourcePath === file.path ? "▾ " : "　"}{file.path}</button>)
          : projectFolders.map((folder, index) => <button className={projectFolder === folder ? styles.folderActive : ""} onClick={() => { setProjectFolder(folder); setProjectTab("project"); setProjectSearch(""); }} key={folder}>{projectFolder === folder ? "▾ " : "　"}{t.folders[index]}</button>)}</aside>
      <div className={styles.projectWorkspace}>
        {projectTab === "project" ? <>
          <div className={styles.projectTools}>
            <button onClick={() => setProjectFolder("Website")} title="Website">⌂</button>
            <span>{projectFolder === "Website" ? "Website" : projectFolder === "Source" ? "Source" : `Assets / ${projectFolder}`}</span>
            <input value={projectSearch} onChange={(event) => setProjectSearch(event.target.value)} placeholder={t.commands.searchFiles} aria-label={t.commands.searchFiles} />
            <button className={assetView === "grid" ? styles.toolActive : ""} onClick={() => setAssetView("grid")} title="Grid">▦</button>
            <button className={assetView === "list" ? styles.toolActive : ""} onClick={() => setAssetView("list")} title="List">☷</button>
            <button disabled={!selectedAsset} onClick={() => { const asset = projectAssets.find((entry) => entry.id === selectedAsset); if (asset) openProjectAsset(asset); }}>{t.commands.open}</button>
          </div>
          <div className={`${styles.assetGrid} ${assetView === "list" ? styles.assetList : ""}`}>
            {visibleProjectAssets.map((asset) => <button
              className={selectedAsset === asset.id ? styles.assetSelected : ""}
              draggable={asset.type === "model"}
              onDragStart={(event) => { if (asset.sceneObject) { event.dataTransfer.setData("application/x-lee-unity-model", asset.sceneObject); event.dataTransfer.effectAllowed = "copy"; } }}
              onClick={() => openProjectAsset(asset)}
              onContextMenu={(event) => { event.preventDefault(); event.stopPropagation(); setSelectedAsset(asset.id); setContextMenu({ x: Math.min(event.clientX, window.innerWidth - 230), y: Math.min(event.clientY, window.innerHeight - 130), kind: "asset", assetId: asset.id }); }}
              title={asset.path}
              key={asset.id}
            ><i className={asset.type === "model" ? styles.blueAsset : asset.type === "content" ? styles.limeAsset : asset.type === "image" ? styles.pinkAsset : asset.type === "source" ? styles.sourceAsset : ""}>{asset.id === "website-blog" ? "▤" : asset.id === "website-profile" ? "▦" : asset.id === "website-friends" ? "◯" : asset.id === "website-links" ? "≈" : asset.type === "scene" ? "◇" : asset.type === "model" ? "⬡" : asset.type === "content" ? "MD" : asset.type === "image" ? "▧" : asset.type === "source" ? "</>" : "●"}</i><span>{asset.label}</span><small>{asset.detail}</small></button>)}
            {!visibleProjectAssets.length && <div className={styles.emptyAssets}>{t.commands.empty}</div>}
          </div>
        </> : projectTab === "console" ? <div className={styles.consoleView}>
          <header><span>{consoleEntries.length} Messages</span><button onClick={() => setConsoleEntries([])}>Clear</button></header>
          {consoleEntries.map((entry, index) => <p key={`${entry}-${index}`}><i>●</i>{entry}</p>)}
        </div> : projectTab === "code" && activeSourceFile ? <div className={styles.codeEditor}>
          <header className={styles.codeToolbar}>
            <button onClick={() => { setProjectTab("project"); setProjectFolder("Source"); }} title={locale === "zh" ? "返回源码" : locale === "ja" ? "ソースへ戻る" : "Back to source"}>←</button>
            <strong title={activeSourceFile.path}>{activeSourceFile.path}</strong>
            <label><span>⌕</span><input value={sourceSearch} onChange={(event) => setSourceSearch(event.target.value)} placeholder={locale === "zh" ? "在文件中查找…" : locale === "ja" ? "ファイル内を検索…" : "Find in file…"} aria-label="Find in source file" /></label>
            {sourceSearch && <small>{sourceMatchCount} {locale === "zh" ? "处匹配" : locale === "ja" ? "件" : "matches"}</small>}
            <button className={sourceLineWrap ? styles.toolActive : ""} onClick={() => setSourceLineWrap((value) => !value)} title="Toggle word wrap">↵</button>
            <button onClick={async () => { try { await navigator.clipboard.writeText(activeSourceFile.content); logAction(locale === "zh" ? "源码已复制" : locale === "ja" ? "ソースをコピーしました" : "Source copied"); } catch { logAction(activeSourceFile.path); } }} title={locale === "zh" ? "复制源码" : locale === "ja" ? "ソースをコピー" : "Copy source"}>⧉</button>
          </header>
          <ol className={`${styles.codeViewport} ${sourceLineWrap ? styles.codeWrap : ""}`} aria-label={`${activeSourceFile.path} read-only source`}>
            {sourceLines.map((line, index) => {
              const matches = sourceSearch && line.toLocaleLowerCase().includes(sourceSearch.toLocaleLowerCase());
              return <li className={matches ? styles.codeMatch : ""} key={index}><span>{index + 1}</span><code>{line || " "}</code></li>;
            })}
          </ol>
          <footer><span>{locale === "zh" ? "只读" : locale === "ja" ? "読み取り専用" : "Read only"}</span><span>UTF-8</span><span>LF</span><span>{activeSourceFile.language}</span><span>{sourceLines.length} lines</span></footer>
        </div> : <div className={styles.animationWindow}>
          <header className={styles.animationToolbar}>
            <button onClick={() => seekMotion(Math.max(0, motionTime - 1 / 30))} title="Previous frame">◀|</button>
            <button className={playModeActive ? styles.toolActive : ""} onClick={toggleMotionPlayback} title="Play / Pause">{playing ? "Ⅱ" : "▶"}</button>
            <button onClick={() => seekMotion(Math.min(10, motionTime + 1 / 30))} title="Next frame">|▶</button>
            <button onClick={stopMotion} title="Stop">■</button>
            <strong>{objectLabel(selected)} · {selectedMotion.mode}</strong>
            <span>{motionTime.toFixed(2)}s</span>
          </header>
          <div className={styles.animationPresets}>
            <span>{locale === "zh" ? "预设" : locale === "ja" ? "プリセット" : "Presets"}</span>
            {(["float", "rotate", "orbit", "sway", "bounce", "pulse"] as MotionMode[]).map((mode) => <button className={selectedMotion.mode === mode ? styles.presetActive : ""} onClick={() => updateSelectedMotion({ enabled: true, mode })} key={mode}>{mode}</button>)}
          </div>
          <div className={styles.timelineRuler}>{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((second) => <span key={second}>{second}s</span>)}</div>
          <input className={styles.timelineScrubber} type="range" min="0" max="10" step="0.01" value={motionTime % 10} onChange={(event) => seekMotion(Number(event.target.value))} aria-label="Animation timeline" />
          <div className={styles.animationTracks}>
            <div><span>Motion.{selectedMotion.mode}</span><b><i style={{ left: `${selectedMotion.phase * 100}%` }} /><i style={{ left: `${((selectedMotion.phase + 0.5) % 1) * 100}%` }} /></b></div>
            <div><span>Transform.{selectedMotion.mode === "pulse" ? "Scale" : selectedMotion.mode === "sway" || selectedMotion.mode === "rotate" ? "Rotation" : "Position"}.{selectedMotion.axis.toUpperCase()}</span><b><i style={{ left: `${selectedMotion.phase * 100}%` }} /><i style={{ left: `${((selectedMotion.phase + 0.25) % 1) * 100}%` }} /><i style={{ left: `${((selectedMotion.phase + 0.75) % 1) * 100}%` }} /></b></div>
            {(selected === "portal" || selected === "riscv") && <div><span>{selected === "portal" ? "Light + Particles" : "LED.Emission"}</span><b><i style={{ left: "0%" }} /><i style={{ left: "50%" }} /><i style={{ left: "100%" }} /></b></div>}
          </div>
        </div>}
      </div>
    </section>}

    {leftPanelVisible && <button className={`${styles.panelResize} ${styles.leftPanelResize}`} onPointerDown={(event) => beginPanelResize("left", event)} onDoubleClick={() => setLeftPanelWidth(250)} aria-label="Resize hierarchy" />}
    {rightPanelVisible && <button className={`${styles.panelResize} ${styles.rightPanelResize}`} onPointerDown={(event) => beginPanelResize("right", event)} onDoubleClick={() => setRightPanelWidth(320)} aria-label="Resize inspector" />}
    {bottomPanelVisible && <button className={`${styles.panelResize} ${styles.bottomPanelResize}`} onPointerDown={(event) => beginPanelResize("bottom", event)} onDoubleClick={() => setBottomPanelHeight(210)} aria-label="Resize project" />}

    {renderContextMenu()}
    <footer className={styles.statusBar}><span>{activity}</span><span>{objectLabel(selected)}</span><span>{projectAssets.length} {t.commands.files}</span></footer>
  </main>;
}
