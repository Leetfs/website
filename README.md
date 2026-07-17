# Lee

Lee 的个人 Website。项目使用 Next.js 静态导出，首页是可交互的 Unity 风格 3D 工作区，博客、个人简介和友链作为同一套编辑器界面中的内容模块呈现。

## 本地运行

需要 Node.js 22.13 或更新版本。

```bash
npm ci
npm run dev
```

生产构建：

```bash
npm run build
```

构建结果位于 `out/`，可以直接交给 Nginx 等静态文件服务器。

## 内容与翻译

- 中文源文档：`content/blog/zh/**/*.md`
- 英文翻译：`content/blog/en/**/*.md`
- 日文翻译：`content/blog/ja/**/*.md`
- Crowdin 规则：`crowdin.yml`

构建时会读取 Git 历史，为文章生成最后修改日期与静态预览数据。

## 3D 模型与许可证

本站分发的外部 3D 模型均由原始发布页明确标记为 [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/)。CC0 允许复制、修改和分发，包括商业使用，且不要求署名；这里仍保留作者和来源，以表达对作者著作权的尊重。

| 本地文件 | 原资源 | 作者 | 原始页面 | 许可证 | 本站处理 |
| --- | --- | --- | --- | --- | --- |
| `public/models/blahaj-optimized.glb` | Shark Plush | gkolesow | [Meshy](https://www.meshy.ai/3d-models/Shark-Plush-v2-0195facc-0265-7b90-95e1-40df4c22f40f) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | 降低模型复杂度并压缩，用作场景中的鲨鱼玩偶 |
| `public/models/terminal-real.glb` | IBM 5155 Computer | Plewr | [itch.io](https://plewr.itch.io/ibm-5155) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | 缩放、简化并转换为 WebP 纹理的 GLB |
| `public/models/portal-real.glb` | Magical Portal | foxfire2017 foxfire | [SummerEngine](https://www.summerengine.com/asset-store/magical-portal-29f31f35) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | 缩放、简化并转换为 WebP 纹理的 GLB |

所有模型的许可证记录和修改说明统一保存在 [`public/models/MODEL-LICENSES.txt`](./public/models/MODEL-LICENSES.txt)。场景中的 RISC-V 开发板、舞台、镜子、灯光等其余几何体由本站代码实时生成，没有引入其他外部模型文件。

CC0 只处理模型作者能够处分的版权及相关权利，不授予第三方商标权，也不代表原作者或品牌方为本站背书。`IBM`、`BLÅHAJ` 等名称仅用于说明场景对象及其来源；本站没有提供模型下载入口。上述审计以原始发布页当前公开的许可证声明为依据。
