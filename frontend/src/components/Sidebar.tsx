import React from 'react';
import {
  LayoutDashboard,
  Database,
  BarChart3,
  TrendingUp,
  Package,
  Award,
  Settings,
  Activity,
  Layers
} from 'lucide-react';

export type TabId = 
  | 'overview'
  | 'datasets'
  | 'analytics'
  | 'forecast'
  | 'inventory'
  | 'performance'
  | 'settings';

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const navigationItems = [
  { id: 'overview' as TabId, label: 'Overview', icon: LayoutDashboard, phase: 'Live' },
  { id: 'datasets' as TabId, label: 'Dataset Management', icon: Database, phase: 'Ingest' },
  { id: 'analytics' as TabId, label: 'Sales Analytics', icon: BarChart3, phase: 'Explore' },
  { id: 'forecast' as TabId, label: 'Forecast Studio', icon: TrendingUp, phase: 'Predict' },
  { id: 'inventory' as TabId, label: 'Inventory Insights', icon: Package, phase: 'ROP' },
  { id: 'performance' as TabId, label: 'Model Performance', icon: Award, phase: 'Benchmark' },
  { id: 'settings' as TabId, label: 'Settings / About', icon: Settings, phase: 'System' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isOpen }) => {
  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <span className="font-semibold text-white tracking-tight text-base block leading-tight">
            DemandSense AI
          </span>
          <span className="text-xs text-indigo-400 font-mono">v1.0.0 • Production UI</span>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Platform Status</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Phase 6: Frontend & Dashboard Active
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                isActive ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-500'
              }`}>
                {item.phase}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>System Healthy</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Retail Demand Intelligence
        </p>
      </div>
    </aside>
  );
};

