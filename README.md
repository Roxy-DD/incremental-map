# Incremental Map（增量地图）

> 基于 Incremental Map Model 的科学知识管理应用（React + TypeScript + IndexedDB）。

[![Deploy Pages](https://img.shields.io/github/actions/workflow/status/Roxy-DD/incremental-map/gh-pages.yml?branch=main&label=pages&logo=github)](https://github.com/Roxy-DD/incremental-map/actions/workflows/gh-pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 在线预览

- **GitHub Pages（生产预览）**：https://roxy-dd.github.io/incremental-map/

> 若你是 Fork 仓库，请将预览地址替换为：`https://<你的GitHub用户名>.github.io/incremental-map/`。

---

## 项目简介

Incremental Map 用于把科学知识拆分为三类可追踪资产：

- **点图（Point Map）**：实验事实，强调客观记录（概率=1）
- **线图（Line Map）**：理论假设，支持版本演化
- **连接（Connection）**：支持 / 矛盾 / 启发 / 验证关系

同时提供误差分层分析（感知、工具、抽象、传播、认知）与贡献评估视图。

---

## 功能清单

- 点图：实验条件、操作步骤、直接结果、误差记录、叠加更新
- 线图：理论假设、预测、验证方法、状态管理与历史版本
- 图谱：点图—线图关系可视化
- 统计：误差分析与贡献评估
- 本地持久化：IndexedDB（Dexie），无需后端
- 国际化：简体中文 / English

---

## 技术栈

- React 18
- TypeScript 5（strict）
- Vite 5
- Tailwind CSS 3
- Dexie.js + dexie-react-hooks
- @xyflow/react / Recharts
- React Router 6

---

## 本地开发

### 1) 环境要求

- Node.js 18+
- pnpm 8+

### 2) 安装与启动

```bash
pnpm install
pnpm dev
```

默认访问：`http://localhost:5173`

### 3) 生产构建

```bash
pnpm build
pnpm preview
```

---

## Docker 部署

### docker compose（推荐）

```bash
docker compose up -d --build
```

访问：`http://localhost:8080`

### 单容器命令

```bash
pnpm docker:build
pnpm docker:run
```

> Nginx 已启用 SPA 回退（`try_files ... /index.html`），刷新路由不会 404。

---

## GitHub Pages 自动部署

工作流文件：`.github/workflows/gh-pages.yml`

### 触发规则

- `pull_request`：构建校验（不发布）
- `push(main/master)`：构建并发布到 Pages
- `workflow_dispatch`：手动触发

### Pages 构建参数

为保证子路径和路由刷新可用，工作流构建时会注入：

- `VITE_ROUTER_MODE=hash`
- `VITE_APP_BASE=/${REPO_NAME}/`

### 发布后检查

1. 打开 **Actions**，确认 `Build and Deploy Pages` 成功
2. 打开 **Deployments**，确认 `github-pages` 环境为最新
3. 访问在线预览链接验证页面与二级路由

---

## 国际化（i18n）

- 语言切换入口：侧边栏
- 已支持：`zh-CN` / `en-US`
- 存储位置：`localStorage`
- Key：`incremental-map-locale`

---

## 项目结构

```text
src/
├── components/
├── pages/
├── hooks/
├── db/
├── i18n/
└── types/
```

---

## 许可证

MIT
