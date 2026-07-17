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

构建时会读取 Git 历史，为文章生成最后修改日期与静态预览数据。正式 CI 使用完整 Git 历史，并在任何文章无法取得 Git 日期时终止部署。

## 部署

推送到 `main` 后，GitHub Actions 会执行检查、构建静态站点，并通过现有的 `SSH_HOST`、`SSH_USER`、`SSH_KEY` secrets 将 `out/` 同步到 `/var/www/blog/`。Crowdin 不在该工作流中运行；Crowdin 写回仓库的翻译提交会像普通内容提交一样触发部署。
