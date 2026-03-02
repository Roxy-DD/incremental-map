import React, { useMemo, useState, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeMouseHandler,
  type ReactFlowInstance,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Network, MapPin, GitBranch, Trash2, X } from 'lucide-react';
import { usePointMaps } from '../hooks/usePointMaps';
import { useLineMaps } from '../hooks/useLineMaps';
import { useConnections } from '../hooks/useConnections';
import { Modal, useConfirm } from '../components/Modal';
import type { PointMap, LineMap, Connection } from '../types';

/** 点图节点组件 */
function PointNode({ data }: { data: { label: string; domain: string; errorCount: number } }) {
  return (
    <div className="bg-white border-2 border-point-500 rounded-xl px-4 py-3 min-w-[180px] max-w-[240px] shadow-sm cursor-pointer hover:shadow-md transition-shadow">
      <Handle type="source" position={Position.Right} className="!bg-point-500 !w-3 !h-3" />
      <Handle type="target" position={Position.Left} className="!bg-point-500 !w-3 !h-3" />
      <div className="flex items-center gap-1.5 mb-1">
        <MapPin className="w-3.5 h-3.5 text-point-600" />
        <span className="text-[10px] font-medium text-point-600 uppercase">点图 P=1</span>
      </div>
      <div className="text-xs font-semibold text-gray-900 leading-snug mb-1 line-clamp-2">{data.label}</div>
      <div className="flex items-center gap-2 text-[10px] text-gray-400">
        <span>{data.domain}</span>
        {data.errorCount > 0 && <span className="text-amber-500">{data.errorCount} 误差</span>}
      </div>
    </div>
  );
}

/** 线图节点组件 */
function LineNode({ data }: { data: { label: string; domain: string; status: string; version: number } }) {
  const statusColors: Record<string, string> = {
    draft: 'border-gray-300',
    published: 'border-line-500',
    archived: 'border-amber-400',
  };
  return (
    <div className={`bg-white border-2 ${statusColors[data.status] || 'border-line-500'} rounded-xl px-4 py-3 min-w-[180px] max-w-[240px] shadow-sm cursor-pointer hover:shadow-md transition-shadow`}>
      <Handle type="source" position={Position.Right} className="!bg-line-500 !w-3 !h-3" />
      <Handle type="target" position={Position.Left} className="!bg-line-500 !w-3 !h-3" />
      <div className="flex items-center gap-1.5 mb-1">
        <GitBranch className="w-3.5 h-3.5 text-line-600" />
        <span className="text-[10px] font-medium text-line-600 uppercase">线图 v{data.version}</span>
      </div>
      <div className="text-xs font-semibold text-gray-900 leading-snug mb-1 line-clamp-2">{data.label}</div>
      <div className="text-[10px] text-gray-400">{data.domain}</div>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  point: PointNode,
  line: LineNode,
};

const EDGE_COLORS: Record<string, string> = {
  supports: '#22c55e',
  contradicts: '#ef4444',
  inspires: '#f59e0b',
  verifies: '#3b82f6',
};

const EDGE_LABELS: Record<string, string> = {
  supports: '支持',
  contradicts: '矛盾',
  inspires: '启发',
  verifies: '验证',
};

const STATUS_LABELS: Record<string, string> = {
  draft: '草稿',
  published: '已发布',
  archived: '已归档',
};

/**
 * 智能布局算法 — 按领域(domain)分组，组内垂直排列
 * 点图在左侧，线图在右侧，避免节点重叠
 */
function computeLayout(points: PointMap[], lines: LineMap[]) {
  const COL_GAP = 450;
  const ROW_GAP = 160;
  const START_X = 80;
  const START_Y = 60;

  // 按domain分组点图
  const pointsByDomain = new Map<string, PointMap[]>();
  for (const p of points) {
    const list = pointsByDomain.get(p.domain) || [];
    list.push(p);
    pointsByDomain.set(p.domain, list);
  }

  // 按domain分组线图
  const linesByDomain = new Map<string, LineMap[]>();
  for (const l of lines) {
    const list = linesByDomain.get(l.domain) || [];
    list.push(l);
    linesByDomain.set(l.domain, list);
  }

  const positions = new Map<string, { x: number; y: number }>();

  // 左列：点图，按domain分组垂直排列
  let yOffset = START_Y;
  for (const [, group] of pointsByDomain) {
    for (const p of group) {
      positions.set(p.id, { x: START_X, y: yOffset });
      yOffset += ROW_GAP;
    }
    yOffset += 40; // domain间距
  }

  // 右列：线图，按domain分组垂直排列
  yOffset = START_Y;
  for (const [, group] of linesByDomain) {
    for (const l of group) {
      positions.set(l.id, { x: START_X + COL_GAP, y: yOffset });
      yOffset += ROW_GAP;
    }
    yOffset += 40;
  }

  return positions;
}

export function GraphPage() {
  const { points } = usePointMaps();
  const { lines } = useLineMaps();
  const { connections, deleteConnection } = useConnections();
  const { confirm, ConfirmDialog } = useConfirm();

  /** ReactFlow 实例引用，用于数据加载后手动调用 fitView */
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  // 选中的节点/边详情
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // 从 live data 查找选中项（避免 stale data）
  const selectedPoint = selectedPointId ? points.find(p => p.id === selectedPointId) : null;
  const selectedLine = selectedLineId ? lines.find(l => l.id === selectedLineId) : null;
  const selectedEdge = selectedEdgeId ? connections.find(c => c.id === selectedEdgeId) : null;

  // 有效节点ID集合（用于过滤孤儿边）
  const nodeIdSet = useMemo(() => {
    const set = new Set<string>();
    for (const p of points) set.add(p.id);
    for (const l of lines) set.add(l.id);
    return set;
  }, [points, lines]);

  const { initialNodes, initialEdges } = useMemo(() => {
    const layoutPositions = computeLayout(points, lines);

    const pointNodes: Node[] = points.map(p => ({
      id: p.id,
      type: 'point',
      position: layoutPositions.get(p.id) ?? { x: 100, y: 100 },
      data: {
        label: p.title,
        domain: p.domain,
        errorCount: p.errors.length,
      },
    }));

    const lineNodes: Node[] = lines.map(l => ({
      id: l.id,
      type: 'line',
      position: layoutPositions.get(l.id) ?? { x: 550, y: 100 },
      data: {
        label: l.title,
        domain: l.domain,
        status: l.status,
        version: l.version,
      },
    }));

    // 过滤孤儿边 — source 或 target 不存在的连接不渲染
    const validConnections = connections.filter(
      c => nodeIdSet.has(c.sourcePointId) && nodeIdSet.has(c.targetLineId)
    );

    const edges: Edge[] = validConnections.map(c => ({
      id: c.id,
      source: c.sourcePointId,
      target: c.targetLineId,
      type: 'smoothstep',
      animated: c.type === 'verifies',
      label: EDGE_LABELS[c.type] || c.type,
      style: { stroke: EDGE_COLORS[c.type] || '#94a3b8', strokeWidth: 2, cursor: 'pointer' },
      labelStyle: { fontSize: 10, fontWeight: 600, fill: EDGE_COLORS[c.type] || '#94a3b8' },
      labelBgStyle: { fill: '#fff', fillOpacity: 0.9 },
      labelBgPadding: [4, 2] as [number, number],
    }));

    return { initialNodes: [...pointNodes, ...lineNodes], initialEdges: edges };
  }, [points, lines, connections, nodeIdSet]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 同步最新数据，但保留用户拖拽后的节点位置
  React.useEffect(() => {
    setNodes(prev => {
      const positionMap = new Map(prev.map(n => [n.id, n.position]));
      return initialNodes.map(n => ({
        ...n,
        position: positionMap.get(n.id) ?? n.position,
      }));
    });
    setEdges(initialEdges);
    // 数据更新后重新 fitView，使画布自动适配节点
    requestAnimationFrame(() => {
      reactFlowInstance.current?.fitView({ padding: 0.2, duration: 300 });
    });
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  /** 节点点击 — 显示详情面板 */
  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedEdgeId(null);
    if (node.type === 'point') {
      setSelectedLineId(null);
      setSelectedPointId(node.id);
    } else {
      setSelectedPointId(null);
      setSelectedLineId(node.id);
    }
  };

  /** 边点击 — 显示连接详情 */
  const handleEdgeClick: EdgeMouseHandler = (_, edge) => {
    setSelectedPointId(null);
    setSelectedLineId(null);
    setSelectedEdgeId(edge.id);
  };

  /** 画布空白处点击 — 关闭所有面板 */
  const handlePaneClick = () => {
    setSelectedPointId(null);
    setSelectedLineId(null);
    setSelectedEdgeId(null);
  };

  /** 删除连接 */
  const handleDeleteEdge = async () => {
    if (!selectedEdge) return;
    const ok = await confirm(`确定删除「${EDGE_LABELS[selectedEdge.type]}」连接吗？此操作不可撤销。`);
    if (!ok) return;
    await deleteConnection(selectedEdge.id);
    setSelectedEdgeId(null);
  };

  const isEmpty = points.length === 0 && lines.length === 0;

  // 孤儿边数量统计
  const orphanCount = connections.length - connections.filter(
    c => nodeIdSet.has(c.sourcePointId) && nodeIdSet.has(c.targetLineId)
  ).length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <Network className="w-6 h-6 text-emerald-600" /> 知识图谱
        </h1>
        <p className="page-subtitle">
          点图（实验记录）与线图（理论猜想）的关联可视化 — 点击节点查看详情，点击连线管理关系
        </p>
      </div>

      {/* 图例 */}
      {!isEmpty && (
      <div className="flex items-center gap-6 mb-4 text-xs text-gray-500 flex-wrap">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border-2 border-point-500 bg-point-50" /> 点图(实验)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border-2 border-line-500 bg-line-50" /> 线图(理论)</span>
        <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-green-500" /> 支持</span>
        <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-red-500" /> 矛盾</span>
        <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-amber-500" /> 启发</span>
        <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-blue-500" /> 验证</span>
        {orphanCount > 0 && (
          <span className="text-amber-600">⚠ {orphanCount} 条孤儿连接已隐藏</span>
        )}
      </div>
      )}

      {/* 图谱画布 */}
      {isEmpty ? (
        <div className="bg-white rounded-2xl border border-gray-200 flex items-center justify-center" style={{ height: '65vh' }}>
          <div className="text-center text-gray-400">
            <Network className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-1">暂无知识图谱数据</p>
            <p className="text-sm">请先添加点图（实验记录）和线图（理论猜想）后，在此查看关联可视化</p>
          </div>
        </div>
      ) : (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{ height: '65vh' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          onPaneClick={handlePaneClick}
          onInit={(instance) => { reactFlowInstance.current = instance; }}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.3}
          maxZoom={2}
          defaultEdgeOptions={{ type: 'smoothstep' }}
        >
          <Background color="#e5e7eb" gap={20} size={1} />
          <Controls
            showInteractive={false}
            className="!rounded-lg !border-gray-200 !shadow-sm"
          />
          <MiniMap
            nodeColor={(node) => node.type === 'point' ? '#3b82f6' : '#a855f7'}
            maskColor="rgba(0,0,0,0.08)"
            className="!rounded-lg !border-gray-200"
          />
        </ReactFlow>
      </div>
      )}

      {/* 统计信息 */}
      <div className="flex items-center gap-6 mt-4 text-xs text-gray-400">
        <span>点图节点: {points.length}</span>
        <span>线图节点: {lines.length}</span>
        <span>连接关系: {connections.length}</span>
      </div>

      {/* 点图详情面板 */}
      <Modal isOpen={!!selectedPoint} onClose={() => setSelectedPointId(null)} title="点图详情" size="md">
        {selectedPoint && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-point-600" />
                <h3 className="text-base font-semibold text-gray-900">{selectedPoint.title}</h3>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="badge-point">{selectedPoint.domain}</span>
                <span className="badge text-gray-500 bg-gray-100">P = 1</span>
                {selectedPoint.tags.map(tag => (
                  <span key={tag} className="badge bg-gray-100 text-gray-600">{tag}</span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm">
              <div>
                <p className="label">实验条件</p>
                <p className="text-gray-700">{selectedPoint.experimentConditions}</p>
              </div>
              <div>
                <p className="label">实验环境</p>
                <p className="text-gray-700">{selectedPoint.environment}</p>
              </div>
              <div>
                <p className="label">操作步骤</p>
                <p className="text-gray-700">{selectedPoint.operations}</p>
              </div>
              <div>
                <p className="label">直接结果</p>
                <p className="text-gray-700 font-medium">{selectedPoint.directResult}</p>
              </div>
              {selectedPoint.mathematicalDescription && (
                <div>
                  <p className="label">数学描述</p>
                  <p className="text-gray-700 font-mono text-xs">{selectedPoint.mathematicalDescription}</p>
                </div>
              )}
            </div>

            {selectedPoint.errors.length > 0 && (
              <div>
                <p className="label">误差分析 ({selectedPoint.errors.length})</p>
                <div className="space-y-1.5">
                  {selectedPoint.errors.map(err => (
                    <div key={err.id} className="flex items-start gap-2 text-xs bg-gray-50 rounded-lg p-2">
                      <span className={`badge badge-error-${err.level}`}>{err.level}</span>
                      <span className="text-gray-600">{err.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
              创建者: {selectedPoint.createdBy} · 创建时间: {new Date(selectedPoint.createdAt).toLocaleString('zh-CN')}
            </div>
          </div>
        )}
      </Modal>

      {/* 线图详情面板 */}
      <Modal isOpen={!!selectedLine} onClose={() => setSelectedLineId(null)} title="线图详情" size="md">
        {selectedLine && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <GitBranch className="w-4 h-4 text-line-600" />
                <h3 className="text-base font-semibold text-gray-900">{selectedLine.title}</h3>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="badge-line">{selectedLine.domain}</span>
                <span className="badge bg-gray-100 text-gray-600">v{selectedLine.version}</span>
                <span className={`badge ${selectedLine.status === 'published' ? 'bg-green-100 text-green-700' : selectedLine.status === 'archived' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                  {STATUS_LABELS[selectedLine.status] || selectedLine.status}
                </span>
                {selectedLine.tags.map(tag => (
                  <span key={tag} className="badge bg-gray-100 text-gray-600">{tag}</span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm">
              <div>
                <p className="label">理论假设</p>
                <p className="text-gray-700">{selectedLine.theoreticalAssumptions}</p>
              </div>
              <div>
                <p className="label">预测</p>
                <p className="text-gray-700">{selectedLine.predictions}</p>
              </div>
              <div>
                <p className="label">验证方法</p>
                <p className="text-gray-700">{selectedLine.verificationMethods}</p>
              </div>
              {selectedLine.historicalBackground && (
                <div>
                  <p className="label">历史背景</p>
                  <p className="text-gray-700">{selectedLine.historicalBackground}</p>
                </div>
              )}
              {selectedLine.references && (
                <div>
                  <p className="label">参考文献</p>
                  <p className="text-gray-700 text-xs">{selectedLine.references}</p>
                </div>
              )}
            </div>

            {selectedLine.linkedPointIds.length > 0 && (
              <div>
                <p className="label">关联的点图 ({selectedLine.linkedPointIds.length})</p>
                <div className="space-y-1">
                  {selectedLine.linkedPointIds.map(pid => {
                    const p = points.find(pt => pt.id === pid);
                    return (
                      <div
                        key={pid}
                        className="flex items-center gap-2 text-xs bg-point-50 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-point-100 transition-colors"
                        onClick={() => { setSelectedLineId(null); setSelectedPointId(pid); }}
                      >
                        <MapPin className="w-3 h-3 text-point-500" />
                        <span className="text-gray-700">{p ? p.title : pid}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
              创建者: {selectedLine.createdBy} · 创建时间: {new Date(selectedLine.createdAt).toLocaleString('zh-CN')}
            </div>
          </div>
        )}
      </Modal>

      {/* 连接(边)详情面板 */}
      <Modal isOpen={!!selectedEdge} onClose={() => setSelectedEdgeId(null)} title="连接详情" size="sm">
        {selectedEdge && (() => {
          const sourcePoint = points.find(p => p.id === selectedEdge.sourcePointId);
          const targetLine = lines.find(l => l.id === selectedEdge.targetLineId);
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-point-50 rounded-lg p-3 text-center">
                  <MapPin className="w-4 h-4 text-point-500 mx-auto mb-1" />
                  <p className="text-xs font-medium text-gray-900 line-clamp-2">
                    {sourcePoint ? sourcePoint.title : '未知点图'}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-8 h-0.5" style={{ backgroundColor: EDGE_COLORS[selectedEdge.type] }} />
                  <span className="text-[10px] font-semibold" style={{ color: EDGE_COLORS[selectedEdge.type] }}>
                    {EDGE_LABELS[selectedEdge.type]}
                  </span>
                </div>
                <div className="flex-1 bg-line-50 rounded-lg p-3 text-center">
                  <GitBranch className="w-4 h-4 text-line-500 mx-auto mb-1" />
                  <p className="text-xs font-medium text-gray-900 line-clamp-2">
                    {targetLine ? targetLine.title : '未知线图'}
                  </p>
                </div>
              </div>

              {selectedEdge.description && (
                <div>
                  <p className="label">描述</p>
                  <p className="text-sm text-gray-700">{selectedEdge.description}</p>
                </div>
              )}

              <div className="text-xs text-gray-400">
                创建时间: {new Date(selectedEdge.createdAt).toLocaleString('zh-CN')}
              </div>

              <div className="pt-3 border-t border-gray-100">
                <button
                  onClick={handleDeleteEdge}
                  className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors w-full"
                >
                  <Trash2 className="w-4 h-4" />
                  删除此连接
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      <ConfirmDialog />
    </div>
  );
}
