import React from 'react';
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
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: '仪表盘', description: '总览' },
  { to: '/points', icon: MapPin, label: '点图管理', description: '实验记录' },
  { to: '/lines', icon: GitBranch, label: '线图管理', description: '理论猜想' },
  { to: '/graph', icon: Network, label: '知识图谱', description: '可视化' },
  { to: '/archive', icon: Archive, label: '归档浏览', description: '理论存档' },
  { to: '/errors', icon: AlertTriangle, label: '误差分析', description: '多层误差' },
  { to: '/evaluation', icon: BarChart3, label: '贡献评估', description: '双重价值' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* 侧边栏 */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-gray-200">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <Map className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-tight">认知地图</h1>
            <p className="text-[10px] text-gray-400 leading-tight">Incremental Map Model</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                isActive ? 'sidebar-link-active' : 'sidebar-link'
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <div>
                <div className="leading-tight">{item.label}</div>
                <div className="text-[10px] opacity-60">{item.description}</div>
              </div>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-[10px] text-gray-400 leading-relaxed">
            <p className="font-medium text-gray-500">增量地图模型</p>
            <p>基于误差认知的科学实在论新框架</p>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
