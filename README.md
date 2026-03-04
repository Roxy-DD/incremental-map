# Incremental Map（增量地图）

> 基于 Incremental Map Model 的科学知识管理 SPA：点图（实验真值）与线图（理论猜想）分离，支持误差分析、关系图谱与贡献评估。

## ✨ 本次增强重点

- 修复与优化整体交互：新增移动端侧边栏、遮罩关闭、紧凑布局间距，提升小屏可用性。
- 完善 i18n：新增中英双语上下文与语言切换器，覆盖主导航、仪表盘与通用空状态文案。
- 完善部署能力：新增 Dockerfile + Nginx SPA 回退配置 + docker-compose 一键启动。
- 完善 GitHub Pages 体验：增加 Pages 工作流，支持 `base` 路径与 Hash Router，避免二级路由 404。

---

## 核心理念

| 模块 | 含义 |
| --- | --- |
| 点图（Point Map） | 实验事实，概率为 1，保持客观记录 |
| 线图（Line Map） | 理论假说，可迭代与版本追踪 |
| 连接（Connection） | 点图与线图之间的支持/矛盾/启发/验证关系 |
| 误差层级 | 感知、工具、抽象、传播、认知 |

---

## 技术栈

- React 18 + TypeScript 5 + Vite 5
- Tailwind CSS 3
- Dexie.js + IndexedDB
- React Router 6
- @xyflow/react + Recharts

---

## 本地开发

```bash
pnpm install
pnpm dev
```

默认地址：`http://localhost:5173`

生产构建：

```bash
pnpm build
pnpm preview
```

---

## i18n 使用说明

- 应用内新增语言切换器（左侧导航区）。
- 当前支持：`简体中文` / `English`。
- 语言偏好写入 `localStorage`，键名：`incremental-map-locale`。

---

## Docker 部署

### 方式一：Docker Compose（推荐）

```bash
docker compose up -d --build
```

访问：`http://localhost:8080`

### 方式二：纯 Docker

```bash
pnpm docker:build
pnpm docker:run
```

实现细节：
- 第一阶段使用 Node 20 + pnpm 构建静态资源。
- 第二阶段使用 Nginx 托管 `dist`。
- `try_files` 已启用，确保 SPA 路由刷新不 404。

---

## GitHub Pages 预览

仓库内已提供 `.github/workflows/gh-pages.yml`：

- push 到 `main` 自动部署（也可手动触发）。
- 构建时自动注入：
  - `VITE_APP_BASE=/${REPO_NAME}/`
  - `VITE_ROUTER_MODE=hash`
- 这样在 Pages 子路径下可稳定打开与刷新各页面。

如需本地模拟 Pages 构建：

```bash
pnpm build:gh
pnpm preview
```

---

## 项目结构（简要）

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
