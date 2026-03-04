import React, { createContext, useContext, useMemo, useState } from 'react';

export type Locale = 'zh-CN' | 'en-US';

type Messages = Record<string, string>;

const messagesByLocale: Record<Locale, Messages> = {
  'zh-CN': {
    'app.notFound.title': '404 — 页面未找到',
    'app.notFound.description': '您访问的页面不存在或已被移除。',
    'app.notFound.backHome': '返回首页',
    'layout.brandTitle': '认知地图',
    'layout.brandSubtitle': 'Incremental Map Model',
    'layout.footerTitle': '增量地图模型',
    'layout.footerDescription': '基于误差认知的科学实在论新框架',
    'layout.nav.dashboard.label': '仪表盘',
    'layout.nav.dashboard.desc': '总览',
    'layout.nav.points.label': '点图管理',
    'layout.nav.points.desc': '实验记录',
    'layout.nav.lines.label': '线图管理',
    'layout.nav.lines.desc': '理论猜想',
    'layout.nav.graph.label': '知识图谱',
    'layout.nav.graph.desc': '可视化',
    'layout.nav.archive.label': '归档浏览',
    'layout.nav.archive.desc': '理论存档',
    'layout.nav.errors.label': '误差分析',
    'layout.nav.errors.desc': '多层误差',
    'layout.nav.evaluation.label': '贡献评估',
    'layout.nav.evaluation.desc': '双重价值',
    'layout.menu': '导航菜单',
    'layout.closeMenu': '关闭菜单',
    'layout.language': '语言',
    'dashboard.loading': '加载中...',
    'dashboard.title': '认知地图工具系统',
    'dashboard.subtitle': '基于增量地图模型(Incremental Map Model)的科学知识管理平台 — 区分实验基础与理论猜想，确保科学知识的累积性',
    'dashboard.recentPoints': '最新点图记录',
    'dashboard.recentLines': '最新线图猜想',
    'dashboard.viewAll': '查看全部',
    'dashboard.emptyPoints': '暂无点图记录',
    'dashboard.emptyLines': '暂无线图记录',
  },
  'en-US': {
    'app.notFound.title': '404 — Page Not Found',
    'app.notFound.description': 'The page you visited does not exist or has been removed.',
    'app.notFound.backHome': 'Back to Home',
    'layout.brandTitle': 'Cognitive Map',
    'layout.brandSubtitle': 'Incremental Map Model',
    'layout.footerTitle': 'Incremental Map Model',
    'layout.footerDescription': 'A scientific realism framework based on error cognition',
    'layout.nav.dashboard.label': 'Dashboard',
    'layout.nav.dashboard.desc': 'Overview',
    'layout.nav.points.label': 'Point Maps',
    'layout.nav.points.desc': 'Experiments',
    'layout.nav.lines.label': 'Line Maps',
    'layout.nav.lines.desc': 'Hypotheses',
    'layout.nav.graph.label': 'Knowledge Graph',
    'layout.nav.graph.desc': 'Visualization',
    'layout.nav.archive.label': 'Archive',
    'layout.nav.archive.desc': 'Theory storage',
    'layout.nav.errors.label': 'Error Analysis',
    'layout.nav.errors.desc': 'Multi-level errors',
    'layout.nav.evaluation.label': 'Contribution',
    'layout.nav.evaluation.desc': 'Dual values',
    'layout.menu': 'Navigation menu',
    'layout.closeMenu': 'Close menu',
    'layout.language': 'Language',
    'dashboard.loading': 'Loading...',
    'dashboard.title': 'Cognitive Map Toolkit',
    'dashboard.subtitle': 'A scientific knowledge management platform based on the Incremental Map Model, separating experimental facts from theoretical conjectures.',
    'dashboard.recentPoints': 'Recent Point Maps',
    'dashboard.recentLines': 'Recent Line Maps',
    'dashboard.viewAll': 'View all',
    'dashboard.emptyPoints': 'No point maps yet',
    'dashboard.emptyLines': 'No line maps yet',
  },
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const storageKey = 'incremental-map-locale';

function getDefaultLocale(): Locale {
  const stored = localStorage.getItem(storageKey);
  if (stored === 'zh-CN' || stored === 'en-US') return stored;
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en-US';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getDefaultLocale());

  const setLocale = (nextLocale: Locale) => {
    localStorage.setItem(storageKey, nextLocale);
    setLocaleState(nextLocale);
  };

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale,
    t: (key: string) => messagesByLocale[locale][key] ?? messagesByLocale['zh-CN'][key] ?? key,
  }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n 必须在 I18nProvider 中使用');
  }
  return context;
}
