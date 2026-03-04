import React from 'react';
import { BarChart3, MapPin, GitBranch, Award, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { ContributionEvaluation } from '../types';
import { useI18n } from '../i18n';

/**
 * 贡献评估页面 (Section 4.3 - 双重价值体系)
 * 
 * 核心理念:
 * 1. 科学贡献以"谁画了更多的点"来评判，而非"谁画了更漂亮的线"
 * 2. 点的价值 > 线的价值（已验证 > 理论预测）
 * 3. 双重价值体系: 鼓励预测，但只认可已验证的价值
 * 4. 使价值更权威、更科学、更规范化
 */
export function EvaluationPage() {
  const { locale } = useI18n();
  const isEn = locale === 'en-US';
  const evaluations = useLiveQuery(async () => {
    const points = await db.points.toArray();
    const lines = await db.lines.toArray();

    // 按创建者聚合
    const scientistMap = new Map<string, ContributionEvaluation>();

    points.forEach(p => {
      if (!scientistMap.has(p.createdBy)) {
        scientistMap.set(p.createdBy, {
          scientistId: p.createdBy,
          scientistName: p.createdBy,
          pointCount: 0,
          lineCount: 0,
          verifiedPredictionRate: 0,
          domains: [],
        });
      }
      const eval_ = scientistMap.get(p.createdBy)!;
      eval_.pointCount++;
      if (!eval_.domains.includes(p.domain)) eval_.domains.push(p.domain);
    });

    lines.forEach(l => {
      if (!scientistMap.has(l.createdBy)) {
        scientistMap.set(l.createdBy, {
          scientistId: l.createdBy,
          scientistName: l.createdBy,
          pointCount: 0,
          lineCount: 0,
          verifiedPredictionRate: 0,
          domains: [],
        });
      }
      const eval_ = scientistMap.get(l.createdBy)!;
      eval_.lineCount++;
      if (!eval_.domains.includes(l.domain)) eval_.domains.push(l.domain);
    });

    // 计算验证率
    for (const eval_ of scientistMap.values()) {
      const myLines = lines.filter(l => l.createdBy === eval_.scientistName);
      const withVerification = myLines.filter(l => l.linkedPointIds.length > 0);
      eval_.verifiedPredictionRate = myLines.length > 0
        ? Math.round((withVerification.length / myLines.length) * 100)
        : 0;
    }

    return Array.from(scientistMap.values()).sort((a, b) => b.pointCount - a.pointCount);
  });

  const data = evaluations ?? [];

  const chartData = data.map(e => ({
    name: e.scientistName.length > 10 ? e.scientistName.substring(0, 10) + '...' : e.scientistName,
    [isEn ? 'Point Contribution' : '点图贡献']: e.pointCount,
    [isEn ? 'Line Contribution' : '线图贡献']: e.lineCount,
    [isEn ? 'Verification Rate' : '验证率']: e.verifiedPredictionRate,
  }));
  const pointContributionKey = isEn ? 'Point Contribution' : '点图贡献';
  const lineContributionKey = isEn ? 'Line Contribution' : '线图贡献';

  // 总体统计
  const totalPoints = data.reduce((s, e) => s + e.pointCount, 0);
  const totalLines = data.reduce((s, e) => s + e.lineCount, 0);
  const avgVerificationRate = data.length > 0
    ? Math.round(data.reduce((s, e) => s + e.verifiedPredictionRate, 0) / data.length)
    : 0;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" /> {isEn ? 'Contribution Evaluation' : '贡献评估'}
        </h1>
        <p className="page-subtitle">
          {isEn
            ? 'Dual-value system: distinguish verified experimental contribution and theoretical prediction contribution.'
            : '双重价值体系 — 区分实验验证贡献与理论预测贡献，"谁画了更多的点"而非"谁画了更漂亮的线"'}
        </p>
      </div>

      {/* 核心理念 */}
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-indigo-800 mb-2">价值体系 I: 实验验证 (点图)</h3>
            <p className="text-sm text-indigo-700 leading-relaxed">
              科学贡献的核心衡量标准是已验证的实验记录数量。点图记录是概率为1的真理近似，
              是科学知识的可靠基础。即使理论框架发生变革，实验记录依然有效。
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-indigo-800 mb-2">价值体系 II: 理论预测 (线图)</h3>
            <p className="text-sm text-indigo-700 leading-relaxed">
              理论预测和抽象研究受到鼓励和支持，但我们只认可通过实验验证的价值。
              预测的价值与已验证的价值是两个独立的体系，就像潜力与当前能力是不同维度。
            </p>
          </div>
        </div>
      </div>

      {/* 总体统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="stat-card text-center">
          <div className="text-3xl font-bold text-gray-900">{data.length}</div>
          <div className="text-xs text-gray-500 mt-1">{isEn ? 'Researchers' : '研究者总数'}</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl font-bold text-point-600">{totalPoints}</div>
          <div className="text-xs text-gray-500 mt-1">{isEn ? 'Total Point Contribution' : '总点图贡献'}</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl font-bold text-line-600">{totalLines}</div>
          <div className="text-xs text-gray-500 mt-1">{isEn ? 'Total Line Contribution' : '总线图贡献'}</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl font-bold text-emerald-600">{avgVerificationRate}%</div>
          <div className="text-xs text-gray-500 mt-1">{isEn ? 'Average Verification Rate' : '平均验证率'}</div>
        </div>
      </div>

      {/* 贡献对比图表 */}
      {chartData.length > 0 && (
        <div className="card mb-8">
            <h3 className="section-title">{isEn ? 'Researcher Contribution Comparison' : '研究者贡献对比'}</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb' }} />
              <Legend
                iconType="circle"
                formatter={(value) => <span style={{ fontSize: 12, color: '#6b7280' }}>{value}</span>}
              />
              <Bar dataKey={pointContributionKey} fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey={lineContributionKey} fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 研究者排行 */}
      <div className="card">
        <h3 className="section-title">{isEn ? 'Researcher Ranking' : '研究者贡献排行'}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase">排名</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase">研究者</th>
                <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 uppercase">
                  <span className="flex items-center justify-center gap-1"><MapPin className="w-3 h-3 text-point-500" /> 点图贡献</span>
                </th>
                <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 uppercase">
                  <span className="flex items-center justify-center gap-1"><GitBranch className="w-3 h-3 text-line-500" /> 线图贡献</span>
                </th>
                <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 uppercase">验证率</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase">覆盖领域</th>
              </tr>
            </thead>
            <tbody>
              {data.map((eval_, i) => (
                <tr key={eval_.scientistId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {i === 0 && <Award className="w-4 h-4 text-amber-500" />}
                      {i === 1 && <Award className="w-4 h-4 text-gray-400" />}
                      {i === 2 && <Award className="w-4 h-4 text-amber-700" />}
                      <span className="font-medium text-gray-600">#{i + 1}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">{eval_.scientistName}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center justify-center min-w-[32px] h-7 bg-point-100 text-point-700 rounded-full text-sm font-bold">
                      {eval_.pointCount}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center justify-center min-w-[32px] h-7 bg-line-100 text-line-700 rounded-full text-sm font-bold">
                      {eval_.lineCount}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${eval_.verifiedPredictionRate}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 min-w-[36px]">{eval_.verifiedPredictionRate}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {eval_.domains.map(d => (
                        <span key={d} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px]">{d}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">{isEn ? 'No contribution data yet' : '暂无贡献数据'}</p>
            <p className="text-xs mt-1">{isEn ? 'Add point maps and line maps to generate evaluation automatically.' : '添加点图和线图后将自动生成贡献评估'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
