# Lee's blog

Lee 的中英日三语博客，记录 RISC-V、Linux、工程实践与日常生活。首页、分类、文章、简历和友链均由 VitePress 和 Project Trans 主题生成。

## 本地运行

使用 Node.js 22.13 或更高版本，在仓库根目录运行

```sh
npm ci
npm run dev
```

`npm run lint` 检查源码。`npm test` 构建全站并检查页面、图片、多语言元数据和预览工作流。`npm run preview` 在本地提供构建好的站点。

## 写作与翻译

中文首页是 `docs/index.md`，技术文章放在 `docs/tips/`，生活随笔放在 `docs/life/`。简历位于 `docs/about/resume.md`，友链位于 `docs/friendly/index.md`。在 Markdown frontmatter 中设置 `title` 即可生成目录和搜索条目。

英文和日文分别使用 `docs/en/`、`docs/ja/` 下的相同结构。`crowdin.yml` 将中文 Markdown 对应到这两个目录。文章的发布日期和修改日期取自 Git 历史，包含改版期间在 `content/blog/` 中保存的修订。

## 部署

`npm run build` 将静态站点输出到 `out/`。生产与 PR 预览工作流共用这一目录。推送至 `main` 后，GitHub Actions 运行检查和全站构建，再将产物同步至 `/var/www/blog/`。静态服务器应将无扩展名的文章地址解析到对应的 `.html` 文件。

PR 构建使用只读权限上传静态产物。独立的发布工作流校验产物后，将预览发布到 Cloudflare Pages，并更新 PR 评论。
