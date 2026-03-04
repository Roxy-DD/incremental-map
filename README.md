# Incremental Map（增量地图）

基于 **Incremental Map Model** 的科学知识管理应用：
- 用 **点图（Point Map）** 记录实验事实（概率=1）
- 用 **线图（Line Map）** 管理理论猜想与版本演化
- 通过 **连接关系 + 误差分析 + 贡献评估** 支撑科研知识沉淀

> 技术栈：React 18 + TypeScript + Vite + Tailwind + Dexie(IndexedDB)

---

## 1. 功能概览

- 点图管理：记录实验条件、操作、直接结果、误差层级、叠加更新
- 线图管理：理论假设、预测、验证方法、版本历史、状态流转
- 知识图谱：点图-线图关系可视化（支持/矛盾/启发/验证）
- 误差分析：按层级、严重程度、领域进行统计展示
- 贡献评估：点图贡献与线图贡献双视角比较

---

## 2. 本地开发

### 环境要求

- Node.js >= 18（建议 20）
- pnpm >= 8

### 启动步骤

```bash
pnpm install
pnpm dev
```

默认访问：`http://localhost:5173`

### 生产构建

```bash
pnpm build
pnpm preview
```

---

## 3. 国际化（i18n）

已内置中英双语（`zh-CN` / `en-US`）：

- 左侧导航支持语言切换
- 语言偏好会写入 `localStorage`
- 键名：`incremental-map-locale`

如果你要继续扩展多语言：
1. 在 `src/i18n/index.tsx` 中补充消息字典
2. 页面内使用 `useI18n().t('key')` 引用文案

---

## 4. Docker 部署

项目已提供多阶段 Docker 构建与 Nginx SPA 回退配置。

### 4.1 使用 docker compose（推荐）

```bash
docker compose up -d --build
```

访问：`http://localhost:8080`

### 4.2 使用 Docker 命令

```bash
pnpm docker:build
pnpm docker:run
```

说明：
- 第一阶段 Node 镜像完成前端构建
- 第二阶段 Nginx 托管 `dist`
- 已配置 `try_files $uri $uri/ /index.html;`，刷新路由不会 404

---

## 5. GitHub Pages 自动部署（重点）

仓库内置工作流：`.github/workflows/gh-pages.yml`

### 5.1 工作流行为

- push 到 `main` 或 `master` 自动触发
- 支持手动触发（`workflow_dispatch`）
- 构建时自动注入：
  - `VITE_APP_BASE=/${REPO_NAME}/`
  - `VITE_ROUTER_MODE=hash`

这两项用于保证 Pages 子路径访问与刷新稳定。

### 5.2 你必须在 GitHub 仓库做的设置

进入仓库：`Settings -> Pages`

- **Build and deployment / Source** 选择：`GitHub Actions`

> 如果仍是 `Deploy from a branch`，自动部署会失败或不生效。

### 5.3 常见失败排查

1. **默认分支不是 main/master**
   - 解决：把 workflow 触发分支改成你的默认分支名

2. **Pages Source 未设置为 GitHub Actions**
   - 解决：按 5.2 配置

3. **仓库是私有且账号/组织策略限制 Pages**
   - 解决：检查仓库可见性与组织策略

4. **路径错误导致白屏或资源 404**
   - 解决：确认 `VITE_APP_BASE=/${{ github.event.repository.name }}/`

5. **路由刷新 404**
   - 解决：Pages 使用 Hash Router（本项目已通过 `VITE_ROUTER_MODE=hash` 处理）

### 5.4 本地模拟 Pages 构建

```bash
VITE_ROUTER_MODE=hash VITE_APP_BASE=/你的仓库名/ pnpm build
pnpm preview
```

将 `你的仓库名` 替换为 GitHub 仓库名，例如 `/incremental-map/`。

---

## 6. 项目结构

```text
src/
├── components/      # 共享组件
├── pages/           # 页面
├── hooks/           # 数据访问 hooks
├── db/              # Dexie 数据层
├── i18n/            # 国际化上下文与字典
└── types/           # 类型定义
```

---

## 7. 许可证

MIT
