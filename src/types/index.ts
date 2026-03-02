// ===================================================================
// 认知地图工具系统 - 核心类型定义
// Based on: The Incremental Map Model (增量地图模型)
// ===================================================================

/** 多层次误差类型 (Section 3: Multi-level Error Analysis) */
export type ErrorLevel =
  | 'perceptual'    // 感知误差 - 人类感官的固有误差
  | 'tool'          // 工具测量误差 - 测量仪器引入的误差
  | 'abstraction'   // 理论抽象误差 - 从经验到理论的抽象过程
  | 'transmission'  // 传播误差 - 知识传递过程中的误差
  | 'cognitive';    // 认知局限误差 - 归纳推理的认知局限

/** 误差记录 */
export interface ErrorRecord {
  id: string;
  level: ErrorLevel;
  description: string;
  magnitude: 'low' | 'medium' | 'high';
  mitigationStrategy?: string;
}

/**
 * 点图 (Point Map) - 实验记录的基础 (Section 4.2.1)
 * 
 * 核心原则:
 * 1. "眼见为实，实验为真" - 概率为1的验证记录
 * 2. 坚决放弃归纳 - 每个实验结果独立记录
 * 3. 独立记录不同结果 - 异常结果不归因于"误差"
 * 4. 叠加更新 - 新验证叠加在旧记录上，保留原始记录
 */
export interface PointMap {
  id: string;
  title: string;
  /** 实验条件的完整描述 */
  experimentConditions: string;
  /** 实验环境 */
  environment: string;
  /** 实验操作步骤 */
  operations: string;
  /** 直接的、非抽象的实验结果 */
  directResult: string;
  /** 数学描述（非抽象的） */
  mathematicalDescription?: string;
  /** 多层次误差分析 */
  errors: ErrorRecord[];
  /** 叠加更新链 - 保留历史记录 */
  overlayHistory: OverlayUpdate[];
  /** 关联的标签 */
  tags: string[];
  /** 关联的学科领域 */
  domain: string;
  /** 创建者 */
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/** 叠加更新记录 (Overlay Update) */
export interface OverlayUpdate {
  id: string;
  pointId: string;
  /** 更精确的实验方法描述 */
  method: string;
  /** 更新后的结果 */
  updatedResult: string;
  /** 更新原因 */
  reason: string;
  timestamp: string;
  updatedBy: string;
}

/**
 * 线图 (Line Map) - 理论猜想的自由空间 (Section 4.2.2)
 * 
 * 核心原则:
 * 1. 科学家的独立性 - 每个科学家自主维护
 * 2. 权威的转移 - 权威来自实验数据，而非个人
 * 3. 点图的客观性 - 线图不能修改点图
 */
export interface LineMap {
  id: string;
  title: string;
  /** 理论假设的清晰陈述 */
  theoreticalAssumptions: string;
  /** 预测内容的具体描述 */
  predictions: string;
  /** 推荐的实验验证方法 */
  verificationMethods: string;
  /** 与点图中实验记录的关联 */
  linkedPointIds: string[];
  /** 理论的历史背景 */
  historicalBackground?: string;
  /** 文献引用 */
  references?: string;
  /** 版本追踪 */
  version: number;
  versionHistory: LineMapVersion[];
  /** 发布/归档状态 */
  status: 'draft' | 'published' | 'archived';
  /** 归档元数据 */
  archivedAt?: string;
  /** 创建者 */
  createdBy: string;
  /** 关联的学科领域 */
  domain: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/** 线图版本记录 (Section 4.2.3 - 版本追踪) */
export interface LineMapVersion {
  version: number;
  snapshot: Omit<LineMap, 'id' | 'versionHistory'>;
  changeDescription: string;
  timestamp: string;
}

/** 点图与线图之间的连接关系 */
export interface Connection {
  id: string;
  sourcePointId: string;
  targetLineId: string;
  /** 连接类型 */
  type: 'supports' | 'contradicts' | 'inspires' | 'verifies';
  description?: string;
  createdAt: string;
}

/** 科学贡献评估 (Section 4.3 - 双重价值体系) */
export interface ContributionEvaluation {
  scientistId: string;
  scientistName: string;
  /** 点图贡献 - 已验证的实验记录数量 */
  pointCount: number;
  /** 线图贡献 - 理论猜想数量 */
  lineCount: number;
  /** 已验证的线图预测占比 */
  verifiedPredictionRate: number;
  /** 覆盖的学科领域 */
  domains: string[];
}

/** 真理的叠加态标注 (Section 2 - Truth as Superposition) */
export interface TruthApproximation {
  id: string;
  pointOrLineId: string;
  type: 'point' | 'line';
  /** 适用条件 */
  applicableConditions: string;
  /** 精度级别 */
  precisionLevel: 'macro' | 'meso' | 'micro' | 'quantum';
  /** 置信区间描述 */
  confidenceDescription: string;
}

/** 用于图可视化的节点数据 */
export interface GraphNode {
  id: string;
  type: 'point' | 'line';
  label: string;
  domain: string;
  status?: string;
}

/** 用于图可视化的边数据 */
export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: Connection['type'];
  label?: string;
}
