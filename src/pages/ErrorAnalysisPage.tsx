import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import {
  useErrorAnalysis,
  ERROR_LEVEL_LABELS,
  ERROR_LEVEL_DESCRIPTIONS,
  ERROR_LEVEL_COLORS,
} from '../hooks/useErrorAnalysis';
import type { ErrorLevel } from '../types';

/**
 * 误差分析页面 (Section 3: Multi-level Error Analysis)
 * 
 * 多层次误差来源:
 * 1. 感知误差 (perceptual)
 * 2. 工具测量误差 (tool)
 * 3. 理论抽象误差 (abstraction)
 * 4. 传播误差 (transmission)
 * 5. 认知局限误差 (cognitive) — 最大的误差来源
 */
export function ErrorAnalysisPage() {
  const analysis = useErrorAnalysis();

  const levelData = Object.entries(analysis.byLevel).map(([level, count]) => ({
    name: ERROR_LEVEL_LABELS[level as ErrorLevel],
    count,
    fill: ERROR_LEVEL_COLORS[level as ErrorLevel],
  }));

  const magnitudeData = [
    { name: '低', value: analysis.byMagnitude.low, fill: '#22c55e' },
    { name: '中', value: analysis.byMagnitude.medium, fill: '#f59e0b' },
    { name: '高', value: analysis.byMagnitude.high, fill: '#ef4444' },
  ];

  const domainRadarData = Object.entries(analysis.byDomain).map(([domain, errors]) => ({
    domain: domain.length > 8 ? domain.substring(0, 8) + '...' : domain,
    ...Object.fromEntries(
      Object.entries(errors).map(([level, count]) => [ERROR_LEVEL_LABELS[level as ErrorLevel], count])
    ),
  }));

  const levels: ErrorLevel[] = ['perceptual', 'tool', 'abstraction', 'transmission', 'cognitive'];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-600" /> 多层次误差分析
        </h1>
        <p className="page-subtitle">
          从感知局限到认知偏差 — 系统分析科学认知中的多层次误差来源及其累积效应
        </p>
      </div>

      {/* 误差层级说明卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-8">
        {levels.map((level, i) => (
          <div key={level} className="card !p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ERROR_LEVEL_COLORS[level] }} />
              <span className="text-xs font-semibold text-gray-700">L{i + 1}: {ERROR_LEVEL_LABELS[level]}</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">{ERROR_LEVEL_DESCRIPTIONS[level]}</p>
            <div className="mt-2 text-lg font-bold" style={{ color: ERROR_LEVEL_COLORS[level] }}>
              {analysis.byLevel[level]}
            </div>
          </div>
        ))}
      </div>

      {/* 累积效应说明 */}
      <div className="bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 rounded-2xl p-5 mb-8">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800 mb-1">误差的累积效应</h3>
            <p className="text-sm text-red-700 leading-relaxed">
              各级误差并非独立存在，而是叠加累积、相互强化。每一层信息传递都增加误差，而认知局限则放大了这些误差的影响。
              这使得科学认知与客观真理之间的差距不断扩大。然而，这并不意味着科学认知是徒劳的 — 
              正如鱼虽不知流体力学却会游泳，真理虽无法穷尽，却可以被运用。科学实践的价值在于不断减少误差、提高认知精度。
            </p>
          </div>
        </div>
      </div>

      {/* 图表区 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 按层级分布 */}
        <div className="card">
          <h3 className="section-title">误差层级分布</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={levelData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="count" name="误差数量" radius={[0, 4, 4, 0]}>
                {levelData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 严重程度分布 */}
        <div className="card">
          <h3 className="section-title">严重程度分布</h3>
          {magnitudeData.some(d => d.value > 0) ? (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={magnitudeData.filter(d => d.value > 0)}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={{ strokeWidth: 1 }}
              >
                {magnitudeData.filter(d => d.value > 0).map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb' }} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value) => <span style={{ fontSize: 12, color: '#6b7280' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
          ) : (
          <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm">
            暂无严重程度数据
          </div>
          )}
        </div>

        {/* 领域雷达图 */}
        {domainRadarData.length > 0 && (
          <div className="card lg:col-span-2">
            <h3 className="section-title">跨领域误差分布雷达</h3>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={domainRadarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="domain" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis tick={{ fontSize: 10 }} />
                {levels.map(level => (
                  <Radar
                    key={level}
                    name={ERROR_LEVEL_LABELS[level]}
                    dataKey={ERROR_LEVEL_LABELS[level]}
                    stroke={ERROR_LEVEL_COLORS[level]}
                    fill={ERROR_LEVEL_COLORS[level]}
                    fillOpacity={0.15}
                  />
                ))}
                <Legend
                  iconType="circle"
                  formatter={(value) => <span style={{ fontSize: 11, color: '#6b7280' }}>{value}</span>}
                />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 各实验的误差累积 */}
      {analysis.cumulativeByPoint.length > 0 && (
        <div className="card">
          <h3 className="section-title">各实验记录的误差累积</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analysis.cumulativeByPoint} margin={{ bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="title" tick={{ fontSize: 10 }} interval={0} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb' }} />
              <Bar dataKey="errorCount" name="误差数量" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 总计 */}
      <div className="mt-6 text-center text-sm text-gray-400">
        总计分析 {analysis.totalErrors} 条误差记录，覆盖 {Object.keys(analysis.byDomain).length} 个学科领域
      </div>
    </div>
  );
}
