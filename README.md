# Incremental Map（增量地图）

基于 Incremental Map Model 的科学知识管理工具（React + TypeScript + IndexedDB）。

- **点图（Point Map）**：记录实验事实（概率=1）
- **线图（Line Map）**：记录理论猜想与迭代
- **连接关系**：支持 / 矛盾 / 启发 / 验证
- **误差分析**：感知、工具、抽象、传播、认知

---

## 快速开始

### 环境

- Node.js 18+
- pnpm 8+

### 本地运行

```bash
pnpm install
pnpm dev
```

默认地址：`http://localhost:5173`

### 生产构建

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

> Nginx 已配置 SPA 回退（`try_files ... /index.html`），前端路由刷新不会 404。

---

## i18n（国际化）

当前支持：`简体中文` / `English`

- 语言切换入口：左侧导航栏
- 持久化位置：`localStorage`
- key：`incremental-map-locale`

---

## GitHub Pages 自动部署（已修复）

工作流文件：`.github/workflows/gh-pages.yml`

### 当前部署策略

- `pull_request`：只构建，不部署（用于提前发现构建问题）
- `push(main/master)`：构建并自动部署到 Pages
- 构建环境固定为：
  - `VITE_ROUTER_MODE=hash`（避免子路径刷新 404）
  - `VITE_APP_BASE=/${REPO_NAME}/`（资源前缀正确）

### 仓库必须配置

进入 GitHub 仓库：`Settings -> Pages`

- Source 选择：**GitHub Actions**

如果你不是这个配置，workflow 即使成功，也可能看不到页面更新。

### 方式一：Docker Compose（推荐）

## 你截图中问题的直接解释

截图里的两行信息：

1. **This branch has not been deployed**
   - 这是正常的：PR 分支默认不会部署生产 Pages。
   - 只有合并进 `main/master`（或手动触发部署工作流）才会产生正式部署记录。

2. **This branch has conflicts that must be resolved**
   - 这会阻止合并，所以自然也不会触发主分支部署。
   - 你图里冲突文件是：
     - `.github/workflows/gh-pages.yml`
     - `README.md`

也就是说，“不能预览”的根因是 **PR 未合并（冲突阻塞）**，不是前端运行失败。

### 方式二：纯 Docker

## 解决冲突建议（最短路径）

在本地执行：

```bash
git checkout <你的功能分支>
git fetch origin
git rebase origin/main
# 处理冲突后
pnpm build
git add .
git rebase --continue
git push --force-with-lease
```

如果默认分支不是 `main`，把 `origin/main` 改成实际默认分支。

---

## 本地模拟 Pages 构建

```bash
VITE_ROUTER_MODE=hash VITE_APP_BASE=/incremental-map/ pnpm build
pnpm preview
```

把 `/incremental-map/` 替换为你的真实仓库名路径。

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

## License

MIT
