import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { ErrorLevel } from '../types';

export const ERROR_LEVEL_LABELS: Record<ErrorLevel, string> = {
  perceptual: '感知误差',
  tool: '工具测量误差',
  abstraction: '理论抽象误差',
  transmission: '传播误差',
  cognitive: '认知局限误差',
};

export const ERROR_LEVEL_DESCRIPTIONS: Record<ErrorLevel, string> = {
  perceptual: '人类感官接收外部信息时，视网膜和大脑的处理过程本身产生的误差',
  tool: '测量工具的测量过程产生的第一层误差，以及工具将结果传递给人类感官时产生的第二层误差',
  abstraction: '从经验现象中提取理论时的抽象过程产生的误差，不同的抽象方法产生不同的理论框架',
  transmission: '科学知识通过文献、教育等渠道传递时，每次传播产生的新误差',
  cognitive: '基于有限实验样本主观赋予模式概率1的认知偏差——科学归纳中最大的误差来源',
};

export const ERROR_LEVEL_COLORS: Record<ErrorLevel, string> = {
  perceptual: '#f59e0b',
  tool: '#ef4444',
  abstraction: '#8b5cf6',
  transmission: '#06b6d4',
  cognitive: '#ec4899',
};

/** 误差分析统计 Hook */
export function useErrorAnalysis() {
  const analysis = useLiveQuery(async () => {
    const points = await db.points.toArray();

    const allErrors = points.flatMap(p => p.errors);
    const totalErrors = allErrors.length;

    // 按层级统计
    const byLevel: Record<ErrorLevel, number> = {
      perceptual: 0,
      tool: 0,
      abstraction: 0,
      transmission: 0,
      cognitive: 0,
    };
    allErrors.forEach(e => { byLevel[e.level]++; });

    // 按严重程度统计
    const byMagnitude = { low: 0, medium: 0, high: 0 };
    allErrors.forEach(e => { byMagnitude[e.magnitude]++; });

    // 按领域统计误差分布
    const byDomain: Record<string, Record<ErrorLevel, number>> = {};
    points.forEach(p => {
      if (!byDomain[p.domain]) {
        byDomain[p.domain] = { perceptual: 0, tool: 0, abstraction: 0, transmission: 0, cognitive: 0 };
      }
      p.errors.forEach(e => { byDomain[p.domain][e.level]++; });
    });

    // 误差累积效应分析
    const cumulativeByPoint = points.map(p => ({
      title: p.title.length > 30 ? p.title.substring(0, 30) + '...' : p.title,
      errorCount: p.errors.length,
      maxMagnitude: p.errors.reduce((max, e) => {
        const ord = { low: 1, medium: 2, high: 3 };
        return ord[e.magnitude] > ord[max] ? e.magnitude : max;
      }, 'low' as 'low' | 'medium' | 'high'),
    }));

    return { totalErrors, byLevel, byMagnitude, byDomain, cumulativeByPoint };
  });

  return analysis ?? {
    totalErrors: 0,
    byLevel: { perceptual: 0, tool: 0, abstraction: 0, transmission: 0, cognitive: 0 },
    byMagnitude: { low: 0, medium: 0, high: 0 },
    byDomain: {},
    cumulativeByPoint: [],
  };
}
