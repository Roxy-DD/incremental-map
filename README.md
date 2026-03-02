# Incremental Map

> 基于增量地图模型（Incremental Map Model）的科学知识管理平台

区分实验基础与理论猜想，确保科学知识的累积性。

---

## 核心理念

本项目实现了一种全新的科学知识管理框架，核心思想来自论文 *"The Incremental Map Model: A New Framework for Scientific Realism Based on Error Cognition"*。

### 三大原则

| 原则 | 说明 |
|------|------|
| **点图 (Point Map)** | "眼见为实，实验为真"。坚决放弃归纳，每个实验结果独立记录，概率为 1。 |
| **线图 (Line Map)** | 科学家的自由空间。每人独立维护理论猜想，权威来自实验数据而非个人。 |
| **真理叠加态** | 真理不是绝对实体，而是由无数可能真理组成的叠加态，在不同层次有不同精度的近似。 |

### 设计哲学

- **点图不可被线图修改** — 实验记录是客观基础，理论假说不能篡改实验事实
- **叠加更新** — 新验证叠加在旧记录上，永远保留原始记录
- **多层次误差分析** — 从感知误差到认知局限，系统化追踪知识传递中的信息损失
- **双重价值体系** — "谁画了更多的点"而非"谁画了更漂亮的线"

---

## 功能特性

### 点图管理（实验记录）
- 创建、编辑、删除实验记录
- 完整记录实验条件、环境、操作步骤、直接结果
- 数学描述支持
- 多层次误差记录（感知/工具/抽象/传播/认知）
- 叠加更新历史链

### 线图管理（理论猜想）
- 创建、编辑理论假设
- 预测内容与验证方法记录
- 版本追踪 — 每次修改自动保存快照
- 状态管理：草稿 → 发布 → 归档
- 关联/取消关联点图

### 知识图谱
- 基于 React Flow 的交互式图谱可视化
- 点图与线图节点以领域分组布局
- 四种连接类型：支持、矛盾、启发、验证
- 点击节点/连线查看详情
- 拖拽布局、缩放、小地图

### 误差分析
- 五级误差层级分布（柱状图）
- 严重程度分布（饼图）
- 跨领域误差雷达图
- 各实验误差累积分析

### 贡献评估
- 双重价值体系的研究者排行
- 点图贡献 vs 线图贡献对比图表
- 验证率统计
- 跨领域覆盖分析

### 归档浏览
- 已归档理论的完整历史
- 恢复为草稿功能
- 版本历史查看
- 关联点图与连接类型展示

---

## 技术栈

| 技术 | 用途 |
|------|------|
| [React 18](https://react.dev) | UI 框架 |
| [TypeScript 5](https://www.typescriptlang.org) | 类型安全 |
| [Vite 5](https://vitejs.dev) | 构建工具与开发服务器 |
| [Tailwind CSS 3](https://tailwindcss.com) | 样式系统 |
| [Dexie.js 4](https://dexie.org) | IndexedDB 封装（本地持久化） |
| [React Flow](https://reactflow.dev) (`@xyflow/react`) | 知识图谱可视化 |
| [Recharts](https://recharts.org) | 数据图表 |
| [React Router 6](https://reactrouter.com) | 路由导航 |
| [Lucide React](https://lucide.dev) | 图标库 |
| [date-fns](https://date-fns.org) | 日期处理 |

**无后端依赖** — 所有数据存储在浏览器 IndexedDB 中，完全本地运行。

---

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org) >= 18
- [pnpm](https://pnpm.io) >= 8

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/<your-username>/incremental-map.git
cd incremental-map

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

浏览器将自动打开 `http://localhost:5173`。首次访问时会自动加载示例数据（经典物理实验）。

### 构建生产版本

```bash
# 类型检查 + 生产构建
pnpm build

# 预览生产构建
pnpm preview
```

---

## 项目结构

```
src/
├── main.tsx                    # 应用入口
├── App.tsx                     # 路由配置（含 404 兜底）
├── index.css                   # Tailwind 指令 + 自定义组件类
├── components/
│   ├── Layout.tsx              # 应用外壳（侧边导航 + 内容区）
│   ├── Modal.tsx               # 模态框 + useConfirm 确认对话
│   ├── PointCard.tsx           # 点图卡片
│   ├── LineCard.tsx            # 线图卡片
│   └── ErrorBadge.tsx          # 误差等级标签
├── pages/
│   ├── DashboardPage.tsx       # 仪表盘概览
│   ├── PointMapPage.tsx        # 点图管理
│   ├── LineMapPage.tsx         # 线图管理
│   ├── GraphPage.tsx           # 知识图谱可视化
│   ├── ArchivePage.tsx         # 归档浏览
│   ├── ErrorAnalysisPage.tsx   # 多层次误差分析
│   └── EvaluationPage.tsx      # 贡献评估
├── hooks/
│   ├── usePointMaps.ts         # 点图数据访问层
│   ├── useLineMaps.ts          # 线图数据访问层
│   ├── useConnections.ts       # 连接关系管理
│   └── useErrorAnalysis.ts     # 误差统计分析
├── db/
│   └── index.ts                # Dexie 数据库定义 + 种子数据
└── types/
    └── index.ts                # TypeScript 类型定义
```

---

## 数据模型

### 点图 (PointMap)

实验记录的基础单元，概率为 1 的已验证结果。

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | `string` | 实验标题 |
| `experimentConditions` | `string` | 实验条件描述 |
| `environment` | `string` | 实验环境 |
| `operations` | `string` | 操作步骤 |
| `directResult` | `string` | 直接的非抽象结果 |
| `mathematicalDescription` | `string?` | 数学描述 |
| `errors` | `ErrorRecord[]` | 多层次误差记录 |
| `overlayHistory` | `OverlayUpdate[]` | 叠加更新链 |
| `domain` | `string` | 学科领域 |
| `tags` | `string[]` | 标签 |

### 线图 (LineMap)

理论猜想的自由空间，支持版本追踪。

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | `string` | 理论标题 |
| `theoreticalAssumptions` | `string` | 理论假设 |
| `predictions` | `string` | 预测内容 |
| `verificationMethods` | `string` | 验证方法 |
| `linkedPointIds` | `string[]` | 关联的点图 |
| `version` | `number` | 当前版本号 |
| `versionHistory` | `LineMapVersion[]` | 版本快照 |
| `status` | `draft \| published \| archived` | 状态 |

### 连接 (Connection)

点图与线图之间的关系。

| 类型 | 说明 |
|------|------|
| `supports` | 实验支持理论 |
| `contradicts` | 实验与理论矛盾 |
| `inspires` | 实验启发理论 |
| `verifies` | 实验验证理论 |

### 误差层级 (ErrorLevel)

| 层级 | 说明 |
|------|------|
| `perceptual` | 感知误差 — 人类感官的固有误差 |
| `tool` | 工具测量误差 — 测量仪器引入的误差 |
| `abstraction` | 理论抽象误差 — 从经验到理论的过程 |
| `transmission` | 传播误差 — 知识传递中的误差 |
| `cognitive` | 认知局限误差 — 归纳推理的最大误差来源 |

---

## 浏览器兼容性

支持所有现代浏览器（Chrome、Firefox、Safari、Edge）。数据存储于浏览器 IndexedDB，清除浏览器数据将丢失所有记录。

---

## 开发指南

### 代码风格

- TypeScript 严格模式，不使用 `as any` / `@ts-ignore`
- 函数组件 + 命名导出（`export function ComponentName()`）
- 2 空格缩进、单引号、分号
- Tailwind CSS 工具类样式
- 中文注释

### 添加新页面

1. 在 `src/pages/` 创建 `XxxPage.tsx`
2. 在 `src/App.tsx` 添加路由
3. 在 `src/components/Layout.tsx` 的 `NAV_ITEMS` 添加导航项

### 添加新数据表

1. 在 `src/types/index.ts` 定义接口
2. 在 `src/db/index.ts` 的 Dexie 类中添加表定义
3. 创建 `src/hooks/useXxx.ts` Hook

---

## 许可证

[MIT](./LICENSE)

---

## 贡献

欢迎贡献！请阅读 [贡献指南](./CONTRIBUTING.md) 了解详情。
