import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, GitBranch, Network, AlertTriangle, Archive, TrendingUp, ArrowRight } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedDatabase } from '../db';
import { PointCard } from '../components/PointCard';
import { LineCard } from '../components/LineCard';

export function DashboardPage() {
  const navigate = useNavigate();
  useEffect(() => { seedDatabase(); }, []);

  const stats = useLiveQuery(async () => {
    const pointCount = await db.points.count();
    const lineCount = await db.lines.count();
    const connectionCount = await db.connections.count();
    const points = await db.points.toArray();
    const lines = await db.lines.toArray();
    const totalErrors = points.reduce((sum, p) => sum + p.errors.length, 0);
    const archivedCount = lines.filter(l => l.status === 'archived').length;
    const publishedCount = lines.filter(l => l.status === 'published').length;

    // 领域统计
    const domains = new Set([...points.map(p => p.domain), ...lines.map(l => l.domain)]);

    // 最新点图和线图
    const recentPoints = points.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3);
    const recentLines = lines.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3);

    return {
      pointCount, lineCount, connectionCount, totalErrors,
      archivedCount, publishedCount, domainCount: domains.size,
      recentPoints, recentLines,
    };
  });

  if (!stats) return <div className="flex items-center justify-center h-64"><div className="text-gray-400">加载中...</div></div>;

  const statCards = [
    { icon: MapPin, label: '点图记录', value: stats.pointCount, color: 'text-point-600', bg: 'bg-point-50', desc: '概率为1的实验验证' },
    { icon: GitBranch, label: '线图猜想', value: stats.lineCount, color: 'text-line-600', bg: 'bg-line-50', desc: '理论预测与假设' },
    { icon: Network, label: '知识连接', value: stats.connectionCount, color: 'text-emerald-600', bg: 'bg-emerald-50', desc: '点图与线图关联' },
    { icon: AlertTriangle, label: '误差记录', value: stats.totalErrors, color: 'text-amber-600', bg: 'bg-amber-50', desc: '多层次误差分析' },
    { icon: Archive, label: '归档理论', value: stats.archivedCount, color: 'text-violet-600', bg: 'bg-violet-50', desc: '代际知识传承' },
    { icon: TrendingUp, label: '学科领域', value: stats.domainCount, color: 'text-cyan-600', bg: 'bg-cyan-50', desc: '跨领域覆盖' },
  ];

  return (
    <div>
      {/* 页头 */}
      <div className="page-header">
        <h1 className="page-title">认知地图工具系统</h1>
        <p className="page-subtitle">
          基于增量地图模型(Incremental Map Model)的科学知识管理平台 — 区分实验基础与理论猜想，确保科学知识的累积性
        </p>
      </div>

      {/* 核心理念横幅 */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-6 mb-8 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-sm text-gray-300 mb-1">核心原则 I</h3>
            <p className="text-sm leading-relaxed">
              <span className="font-bold text-point-200">点图</span> — "眼见为实，实验为真"。坚决放弃归纳，每个实验结果独立记录，概率为1。
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-300 mb-1">核心原则 II</h3>
            <p className="text-sm leading-relaxed">
              <span className="font-bold text-line-200">线图</span> — 科学家的自由空间。每人独立维护理论猜想，权威来自实验数据而非个人。
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-300 mb-1">核心原则 III</h3>
            <p className="text-sm leading-relaxed">
              <span className="font-bold text-amber-200">真理叠加态</span> — 真理不是绝对实体，而是由无数可能真理组成的叠加态，在不同层次有不同精度的近似。
            </p>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label} className="stat-card">
            <div className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center mb-3`}>
              <card.icon className={`w-4.5 h-4.5 ${card.color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            <div className="text-xs font-medium text-gray-600 mt-0.5">{card.label}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{card.desc}</div>
          </div>
        ))}
      </div>

      {/* 最近记录 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 最新点图 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title !mb-0">最新点图记录</h2>
            <Link to="/points" className="text-xs text-point-600 hover:text-point-700 flex items-center gap-1">
              查看全部 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentPoints.map(p => (
              <div key={p.id} className="cursor-pointer" onClick={() => navigate('/points')}>
                <PointCard point={p} compact />
              </div>
            ))}
            {stats.recentPoints.length === 0 && (
              <div className="card text-center text-gray-400 text-sm py-8">暂无点图记录</div>
            )}
          </div>
        </div>

        {/* 最新线图 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title !mb-0">最新线图猜想</h2>
            <Link to="/lines" className="text-xs text-line-600 hover:text-line-700 flex items-center gap-1">
              查看全部 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentLines.map(l => (
              <div key={l.id} className="cursor-pointer" onClick={() => navigate('/lines')}>
                <LineCard line={l} compact />
              </div>
            ))}
            {stats.recentLines.length === 0 && (
              <div className="card text-center text-gray-400 text-sm py-8">暂无线图记录</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
