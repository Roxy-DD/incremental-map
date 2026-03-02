import Dexie, { type EntityTable } from 'dexie';
import type { PointMap, LineMap, Connection } from '../types';

/**
 * 认知地图数据库
 * 使用 IndexedDB (Dexie.js) 实现本地持久化
 * 符合论文中"每个科学家独立维护自己的地图"的理念
 */
class CognitiveMapDB extends Dexie {
  points!: EntityTable<PointMap, 'id'>;
  lines!: EntityTable<LineMap, 'id'>;
  connections!: EntityTable<Connection, 'id'>;

  constructor() {
    super('CognitiveMapDB');
    this.version(1).stores({
      points: 'id, title, domain, createdBy, createdAt, *tags',
      lines: 'id, title, domain, createdBy, status, createdAt, *tags, *linkedPointIds',
      connections: 'id, sourcePointId, targetLineId, type, createdAt',
    });
  }
}

export const db = new CognitiveMapDB();

/** 生成唯一 ID */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/** 初始化示例数据 */
export async function seedDatabase(): Promise<void> {
  const pointCount = await db.points.count();
  if (pointCount > 0) return;

  const now = new Date().toISOString();

  // 示例点图数据 — 经典物理实验
  const points: PointMap[] = [
    {
      id: generateId(),
      title: '自由落体实验 — 铁球与羽毛（真空管）',
      experimentConditions: '真空管内，海拔 50m，温度 20°C，气压 1013hPa',
      environment: '实验室真空管装置，真空度 < 0.01Pa',
      operations: '同时释放 1kg 铁球和 5g 羽毛，高速摄像记录下落过程',
      directResult: '两物体同时着地，下落时间 3.19s，高度 50m',
      mathematicalDescription: 'h = ½gt², t = √(2h/g) = √(100/9.8) ≈ 3.19s',
      errors: [
        { id: generateId(), level: 'tool', description: '高速摄像机时间分辨率 ±0.001s', magnitude: 'low' },
        { id: generateId(), level: 'perceptual', description: '人工判定"同时着地"存在视觉延迟', magnitude: 'low' },
      ],
      overlayHistory: [],
      tags: ['力学', '自由落体', '真空'],
      domain: '经典力学',
      createdBy: '伽利略研究组',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      title: '双缝干涉实验 — 单光子发射',
      experimentConditions: '单光子源，双缝间距 0.25mm，缝到屏距离 1m',
      environment: '暗室，温度恒控 22°C，光学平台隔振',
      operations: '以 1 光子/秒 速率发射，CCD 记录 24h 累积图样',
      directResult: '累积 86400 次光子击中后呈现明暗相间干涉条纹，条纹间距 2.53mm',
      mathematicalDescription: 'Δy = λL/d，λ=632.8nm 时理论值 2.53mm，实测 2.53±0.02mm',
      errors: [
        { id: generateId(), level: 'tool', description: 'CCD 像素尺寸限制空间分辨率 ±0.01mm', magnitude: 'low' },
        { id: generateId(), level: 'cognitive', description: '单光子如何产生干涉——归纳推理的认知局限', magnitude: 'high' },
      ],
      overlayHistory: [],
      tags: ['量子力学', '双缝干涉', '光子'],
      domain: '量子物理',
      createdBy: '量子光学实验室',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      title: '迈克尔逊-莫雷实验',
      experimentConditions: '干涉仪臂长 11m，光源 钠灯 589nm',
      environment: '地下室石基座，温度恒控，1887年克利夫兰',
      operations: '旋转干涉仪 360°，每 22.5° 记录条纹移动',
      directResult: '未观测到预期的 0.4 条纹级移动，实际移动 < 0.01 条纹级',
      mathematicalDescription: 'Δn = 2Lv²/(λc²)，预期 Δn≈0.4，实测 Δn<0.01',
      errors: [
        { id: generateId(), level: 'tool', description: '干涉仪机械振动导致条纹抖动 ±0.005 级', magnitude: 'medium' },
        { id: generateId(), level: 'perceptual', description: '目视读数条纹位置存在主观误差', magnitude: 'medium' },
      ],
      overlayHistory: [],
      tags: ['光学', '以太', '相对论'],
      domain: '经典光学/相对论',
      createdBy: 'Michelson & Morley',
      createdAt: now,
      updatedAt: now,
    },
  ];

  // 示例线图数据 — 理论猜想
  const lines: LineMap[] = [
    {
      id: generateId(),
      title: '惯性质量与引力质量等价原理',
      theoreticalAssumptions: '惯性质量与引力质量在所有条件下严格相等，这是广义相对论的基础假设',
      predictions: '1. 所有物体在引力场中以相同加速度下落\n2. 引力红移效应\n3. 光线在引力场中弯曲',
      verificationMethods: '1. 厄缶实验（扭秤法）精确比较惯性质量与引力质量\n2. Pound-Rebka 实验验证引力红移\n3. 日食观测光线弯曲',
      linkedPointIds: [points[0].id],
      historicalBackground: '爱因斯坦 1907 年提出等价原理，成为广义相对论(1915)的基石',
      references: 'Einstein, A. (1907). Über das Relativitätsprinzip.',
      version: 1,
      versionHistory: [],
      status: 'published',
      createdBy: 'Albert Einstein',
      domain: '理论物理',
      tags: ['相对论', '等价原理', '引力'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      title: '量子退相干解释 — 双缝实验',
      theoreticalAssumptions: '量子系统与环境的相互作用导致相干性丧失，宏观世界不出现量子叠加态',
      predictions: '1. 增加"路径探测"装置后干涉条纹消失\n2. 退相干速率与系统-环境耦合强度正相关\n3. 介观系统可观测部分退相干',
      verificationMethods: '1. 在双缝后添加弱测量装置观察干涉条纹退化\n2. 超导量子比特退相干时间测量\n3. 分子干涉实验(C60富勒烯)',
      linkedPointIds: [points[1].id],
      historicalBackground: 'Zurek (1981, 2003) 系统发展了退相干理论作为量子-经典过渡的解释',
      references: 'Zurek, W.H. (2003). Decoherence, einselection, and the quantum origins of the classical. Rev. Mod. Phys.',
      version: 1,
      versionHistory: [],
      status: 'published',
      createdBy: 'W.H. Zurek',
      domain: '量子物理',
      tags: ['量子力学', '退相干', '测量问题'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      title: '暗物质粒子假说',
      theoreticalAssumptions: '宇宙中存在不参与电磁相互作用的大质量粒子(WIMP)，解释星系旋转曲线异常',
      predictions: '1. 地下探测器应能观测到 WIMP 与原子核的碰撞信号\n2. 对撞机可能产生暗物质粒子\n3. 暗物质湮灭应产生可探测的伽马射线',
      verificationMethods: '1. 地下直接探测实验 (XENON, PandaX)\n2. LHC 缺失能量搜索\n3. 费米伽马射线望远镜间接探测',
      linkedPointIds: [],
      historicalBackground: 'Zwicky (1933) 首次提出暗物质概念，Rubin (1970s) 通过旋转曲线提供了强有力证据',
      references: 'Bertone, G. et al. (2005). Particle dark matter: evidence, candidates and constraints.',
      version: 1,
      versionHistory: [],
      status: 'draft',
      createdBy: '暗物质研究组',
      domain: '粒子物理/宇宙学',
      tags: ['暗物质', 'WIMP', '宇宙学'],
      createdAt: now,
      updatedAt: now,
    },
  ];

  // 示例连接
  const connections: Connection[] = [
    {
      id: generateId(),
      sourcePointId: points[0].id,
      targetLineId: lines[0].id,
      type: 'supports',
      description: '自由落体实验支持惯性质量=引力质量的等价原理',
      createdAt: now,
    },
    {
      id: generateId(),
      sourcePointId: points[1].id,
      targetLineId: lines[1].id,
      type: 'inspires',
      description: '单光子双缝干涉激发了退相干理论的研究',
      createdAt: now,
    },
    {
      id: generateId(),
      sourcePointId: points[2].id,
      targetLineId: lines[0].id,
      type: 'verifies',
      description: 'MM实验零结果验证了相对论的基本假设（光速不变）',
      createdAt: now,
    },
  ];

  await db.transaction('rw', [db.points, db.lines, db.connections], async () => {
    await db.points.bulkAdd(points);
    await db.lines.bulkAdd(lines);
    await db.connections.bulkAdd(connections);
  });
}
