# 贡献指南

感谢你对 Incremental Map 的关注！我们欢迎所有形式的贡献。

## 开始之前

1. 确保已安装 [Node.js](https://nodejs.org) >= 18 和 [pnpm](https://pnpm.io) >= 8
2. Fork 本仓库并克隆到本地
3. 安装依赖：`pnpm install`
4. 启动开发服务器：`pnpm dev`

## 开发流程

### 1. 创建分支

```bash
git checkout -b feat/your-feature-name
# 或
git checkout -b fix/issue-description
```

### 2. 分支命名规范

| 前缀 | 用途 |
|------|------|
| `feat/` | 新功能 |
| `fix/` | Bug 修复 |
| `docs/` | 文档更新 |
| `refactor/` | 代码重构 |
| `style/` | 样式调整 |

### 3. 提交信息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>(<scope>): <description>

[optional body]
```

**类型：**

| 类型 | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档 |
| `style` | 样式（不影响逻辑） |
| `refactor` | 重构 |
| `perf` | 性能优化 |
| `chore` | 构建/工具链 |

**示例：**

```
feat(line-map): 添加版本对比功能
fix(graph): 修复节点拖拽后位置丢失
docs: 更新数据模型文档
```

### 4. 构建验证

提交 PR 前请确保：

```bash
# 类型检查 + 生产构建
pnpm build
```

构建必须零错误通过。

## 代码规范

### TypeScript

- 严格模式 — 不使用 `as any`、`@ts-ignore`、`@ts-expect-error`
- 使用 `interface` 定义对象形状，`type` 定义联合类型/别名
- 类型导入使用 `import type { ... }`

### React 组件

- 函数组件 + 命名导出：`export function MyComponent() {}`
- Props 接口以 `Props` 后缀命名：`interface MyComponentProps {}`
- 一个文件一个组件

### 样式

- 使用 Tailwind CSS 工具类
- 可复用样式定义在 `src/index.css` 的 `@layer components` 中
- 不使用 CSS Modules 或 styled-components

### 文件命名

- 组件/页面：PascalCase（`PointCard.tsx`、`DashboardPage.tsx`）
- Hooks/工具：camelCase（`usePointMaps.ts`）
- 页面文件以 `Page` 后缀命名

### 注释

- 使用中文注释
- 接口和函数使用 JSDoc（`/** ... */`）

## 提交 Pull Request

1. 确保分支基于最新的 `main` 分支
2. 确保 `pnpm build` 通过
3. 在 PR 描述中说明：
   - **变更内容** — 做了什么
   - **变更原因** — 为什么要做
   - **如何测试** — 怎样验证
4. 如果涉及 UI 变更，附上截图

## 报告 Bug

请通过 [Issues](../../issues) 提交 Bug 报告，包含：

- 浏览器及版本
- 复现步骤
- 预期行为 vs 实际行为
- 截图（如有）

## 功能建议

欢迎通过 [Issues](../../issues) 提交功能建议。请描述：

- 使用场景
- 预期行为
- 是否愿意参与实现

---

感谢你的贡献！
