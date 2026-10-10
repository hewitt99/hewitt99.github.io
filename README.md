# Hewitt's Blog

一个基于 Astro 构建的现代博客系统，支持 Markdown 写作、深色模式、响应式设计和 SEO 优化。

## ✨ 特性

### 🏗️ 基础结构

- ✅ **页面路由系统** - 支持首页、文章详情页、分类页、标签页、404页等
- ✅ **布局组件** - 统一的头部、底部、导航、侧边栏等布局结构
- ✅ **Markdown 支持** - 使用 .md 或 .mdx 写博客文章
- ✅ **静态资源支持** - 支持图片、封面图、本地图标等资源

### 📄 页面模块

- ✅ **首页** - 显示文章列表、摘要、封面图、分页等
- ✅ **文章详情页** - 渲染 Markdown 内容，支持代码高亮
- ✅ **分类页** - 展示某个分类下的所有文章
- ✅ **标签页** - 展示某个标签下的所有文章
- ✅ **404 页面** - 自定义未找到页面
- ✅ **关于我页面** - 显示博主简介、联系方式等

### 🎨 UI/样式模块

- ✅ **Tailwind CSS** - 快速搭建 UI 风格
- ✅ **代码高亮** - 使用 Astro 的 shiki 插件
- ✅ **文章卡片组件** - 显示文章列表中的封面图 + 摘要等信息
- ✅ **深色模式** - 切换浅色/深色模式支持
- ✅ **响应式设计** - 移动端适配

### 🚀 可选功能扩展

- ✅ **文章阅读进度条** - 阅读体验优化
- ✅ **分页功能** - 支持文章列表分页
- ✅ **面包屑导航** - 清晰的页面层级导航

## 📁 项目结构

```
src/
├── components/        # 通用组件
│   ├── Header.astro          # 头部导航组件
│   ├── Footer.astro          # 底部组件
│   ├── ArticleCard.astro     # 文章卡片组件
│   └── Pagination.astro      # 分页组件
├── layouts/           # 页面布局组件
│   ├── BaseLayout.astro      # 基础布局
│   └── BlogLayout.astro      # 博客文章布局
├── pages/             # Astro 页面
│   ├── index.astro           # 首页
│   ├── about.astro           # 关于页面
│   ├── 404.astro             # 404页面
│   ├── blog/
│   │   └── [slug].astro      # 文章详情页
│   ├── categories/
│   │   ├── index.astro       # 分类列表页
│   │   └── [category].astro  # 特定分类页
│   └── tags/
│       ├── index.astro       # 标签列表页
│       └── [tag].astro       # 特定标签页
├── content/           # 存放 Markdown 文章与碎碎念
│   ├── blog/
│   │   ├── hello-world.md
│   │   └── …
│   └── notes/         # 一文一笔记（文件名 = post slug）
│       └── enterprise-bi-platform.md
├── styles/            # 全局 CSS/Tailwind config
│   └── global.css
├── utils/             # 工具函数
│   └── index.ts              # 日期格式化、获取所有文章等
├── types.ts           # TypeScript 类型定义
└── config.ts          # 站点配置
```

## 🛠️ 技术栈

- **框架**: [Astro](https://astro.build) - 现代静态站点生成器
- **样式**: [Tailwind CSS](https://tailwindcss.com) - 实用优先的 CSS 框架
- **语言**: [TypeScript](https://www.typescriptlang.org) - 类型安全的 JavaScript
- **内容**: Markdown/MDX - 简单易用的内容格式
- **代码高亮**: Shiki - 高质量的语法高亮
- **部署**: [Vercel](https://vercel.com) - 快速部署平台

## 🚀 快速开始

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 启动开发服务器

```bash
npm run start
# 或
npm run dev
```

访问 [http://localhost:4321](http://localhost:4321) 查看博客。

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## ✍️ 写作指南

### 创建新文章

1. 在 `src/content/blog/` 目录下创建新的 `.md` 文件
2. 添加 frontmatter 元数据：

```markdown
---
title: '文章标题'
description: '文章描述'
publishDate: '2024-01-15'
category: '分类名称'
tags: ['标签1', '标签2']
author: '作者名'
heroImage: '/images/hero.jpg' # 可选
---

# 文章内容

这里是文章的正文内容...
```

### Frontmatter 字段说明

- `title`: 文章标题（必需）
- `description`: 文章描述，用于 SEO（必需）
- `publishDate`: 发布日期，格式：YYYY-MM-DD（必需）
- `category`: 文章分类（必需）
- `tags`: 文章标签数组（必需）
- `author`: 作者名称（可选）
- `heroImage`: 封面图片路径（可选）
- `updatedDate`: 更新日期（可选）
- `draft`: 是否为草稿，默认 false（可选）。生产构建不会生成草稿详情页；`astro dev` 可预览。

### 按文章碎碎念（Reading Notes）

一文一文件，挂在正式文章上，按日期块追加，不写进正文。

1. 在 `src/content/notes/` 创建与文章 slug 同名的 `.md`（如 `enterprise-bi-platform.md`）
2. Frontmatter 约定：

```markdown
---
postSlug: enterprise-bi-platform
title: 碎碎念 · 企业 BI 平台   # 可选
visibility: private            # private | public，默认 private
updatedDate: 2026-10-10
---

## 2026-10-10

- 今天的碎碎念……
```

约定：

- **一文一文件**；只追加 `## YYYY-MM-DD` 日期块（推荐最新在上）
- `visibility: private`（默认）：生产 build **不**生成 `/notes/[slug]`，文章页也无入口；`astro dev`（或 `NOTE_VISIBILITY=all`）可本地预览全部
- `visibility: public`：正常进生产站点
- 公开仓库里 `private` 只挡站点 HTML，**源码仍可见**；敏感内容请勿 commit，或自行把 `src/content/notes/` 加入 `.gitignore`（见文件内注释）

本地预览示例：文章 [/blog/enterprise-bi-platform](/blog/enterprise-bi-platform) → 笔记 [/notes/enterprise-bi-platform](/notes/enterprise-bi-platform)

## ⚙️ 配置

### 站点配置

编辑 `src/config.ts` 文件来修改站点基本信息：

```typescript
export const SITE_CONFIG: SiteConfig = {
	title: 'Your Blog Title',
	description: 'Your blog description',
	author: 'Your Name',
	url: 'https://yourdomain.com',
	social: {
		github: 'https://github.com/yourusername',
		twitter: 'https://twitter.com/yourusername',
		email: 'your@email.com'
	},
	postsPerPage: 10
}
```

### Astro 配置

编辑 `astro.config.mjs` 文件来修改 Astro 相关配置。

## 🎨 自定义样式

### 全局样式

编辑 `src/styles/global.css` 文件来修改全局样式。

### Tailwind 配置

编辑 `tailwind.config.js` 文件来自定义 Tailwind CSS 配置。

## 📱 响应式设计

博客已经针对不同设备进行了优化：

- **桌面端**: 完整的布局和功能
- **平板端**: 适配中等屏幕尺寸
- **移动端**: 优化的移动体验，包括移动导航菜单

## 🌙 深色模式

博客支持自动深色模式切换：

- 用户可以手动切换主题
- 主题偏好会保存在本地存储中
- 支持系统主题检测

## 🔍 SEO 优化

博客已经进行了 SEO 优化：

- 语义化的 HTML 结构
- Meta 标签优化
- Open Graph 支持
- 规范化 URL

## 📊 性能优化

- 静态站点生成，加载速度快
- 图片懒加载
- CSS 和 JavaScript 压缩
- 字体优化
- 代码分割

## 🚀 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 自动部署完成

### 其他平台

博客可以部署到任何支持静态站点的平台：

- Netlify
- GitHub Pages
- Cloudflare Pages
- AWS S3

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

- GitHub: [@hewitt99](https://github.com/hewitt99)
- Email: hewitt.99@qq.com

---

**享受写作的乐趣！** ✨
