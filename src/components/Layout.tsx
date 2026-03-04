import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  GitBranch,
  Network,
  Archive,
  AlertTriangle,
  BarChart3,
  Map,
  Menu,
  X,
} from 'lucide-react';
import { useI18n } from '../i18n';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, key: 'dashboard' },
  { to: '/points', icon: MapPin, key: 'points' },
  { to: '/lines', icon: GitBranch, key: 'lines' },
  { to: '/graph', icon: Network, key: 'graph' },
  { to: '/archive', icon: Archive, key: 'archive' },
  { to: '/errors', icon: AlertTriangle, key: 'errors' },
  { to: '/evaluation', icon: BarChart3, key: 'evaluation' },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <button
        type="button"
        className="fixed top-3 left-3 z-30 p-2 rounded-lg bg-white border border-gray-200 shadow-sm lg:hidden"
        onClick={() => setSidebarOpen(prev => !prev)}
        aria-label={isSidebarOpen ? t('layout.closeMenu') : t('layout.menu')}
      >
        {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {isSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-gray-900/40 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label={t('layout.closeMenu')}
        />
      )}

      <aside className={`w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 fixed lg:static inset-y-0 left-0 z-20 transform transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center gap-3 px-5 border-b border-gray-200">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <Map className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-tight">{t('layout.brandTitle')}</h1>
            <p className="text-[10px] text-gray-400 leading-tight">{t('layout.brandSubtitle')}</p>
          </div>
        </div>

        <div className="p-3 border-b border-gray-100">
          <label className="label !text-xs !mb-1">{t('layout.language')}</label>
          <select
            className="input !py-1.5"
            value={locale}
            onChange={event => setLocale(event.target.value as 'zh-CN' | 'en-US')}
          >
            <option value="zh-CN">简体中文</option>
            <option value="en-US">English</option>
          </select>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                isActive ? 'sidebar-link-active' : 'sidebar-link'
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <div>
                <div className="leading-tight">{t(`layout.nav.${item.key}.label`)}</div>
                <div className="text-[10px] opacity-60">{t(`layout.nav.${item.key}.desc`)}</div>
              </div>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="text-[10px] text-gray-400 leading-relaxed">
            <p className="font-medium text-gray-500">{t('layout.footerTitle')}</p>
            <p>{t('layout.footerDescription')}</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto lg:ml-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-16 lg:pt-8 pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
