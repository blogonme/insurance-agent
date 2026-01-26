# InsurePro - 智能保险经纪人专业管理系统 v2.0

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Status](https://img.shields.io/badge/status-Stable-green.svg)

**InsurePro** 是一款专为高级保险经纪人量身定制的、具备多租户能力的数字化展业平台。它不仅是一个精美的展示门户，更是一个强大的客户管理与业务驱动引擎。

## ✨ 2.0 核心特性

- 🛡️ **安全登录墙**: 全站启用 Supabase 身份验证，确保经纪人数据的安全性。
- 🤝 **多租户架构 (SaaS)**: 支持不同经纪人独立注册、独立数据隔离，共用一套高效系统。
- 🔗 **专属分享链接**: 一键生成带有经纪人标识（Slug）的专属链接，访客无需登录即可浏览特定经纪人的方案与案例。
- 📊 **智能评估系统**: 沉浸式客户风险测试，自动生成建议并转化为业务咨询。
- 🔍 **灵感搜索 (Bing 驱动)**: 管理后台集成新闻/案例搜索，一键捕捉行业动向与分享灵感。
- 📱 **响应式 Vercel 审美**: 基于 React + Tailwind CSS 构建，极致的移动端与窄屏适配体验。

## 🚀 快速开始

### 环境要求

- Node.js 18+
- Docker (运行本地 Supabase)

### 本地部署

1. 克隆仓库: `git clone https://github.com/blogonme/insurance-agent.git`
2. 安装依赖: `npm install`
3. 启动本地数据库: `npx supabase start`
4. 初始化数据: `npx supabase db reset`
5. 运行项目: `npm run dev`

### 访问入口

- **首页**: `http://localhost:5173`
- **专属分享示例**: `http://localhost:5173/?s=demo-team`
- **测试账号**: `13800138000` / `123456`

## 🛠️ 技术仓库

- **前端**: React, Vite, Lucide React, Framer Motion
- **后端**: Supabase (PostgreSQL, Auth, RLS)
- **样式**: Tailwind CSS (Modern Aesthetic)

---

_© 2026 InsurePro Team. 并不仅是一个工具，更是您的数字名片。_
