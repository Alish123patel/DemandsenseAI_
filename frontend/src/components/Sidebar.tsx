import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  Package,
  ShieldCheck,
  Database,
  Settings,
} from 'lucide-react';

export type TabId = 
  | 'overview'
  | 'analytics'
  | 'forecast'
  | 'inventory'
  | 'performance'
  | 'datasets'
  | 'settings';

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const navigationItems = [
  { id: 'overview' as TabId, label: 'Overview', icon: LayoutDashboard, tag: 'Dashboard' },
  { id: 'forecast' as TabId, label: 'Demand Forecast', icon: TrendingUp, tag: 'Projections' },
  { id: 'inventory' as TabId, label: 'Restock Planner', icon: Package, tag: 'Orders' },
  { id: 'analytics' as TabId, label: 'Sales Trends', icon: BarChart3, tag: 'History' },
  { id: 'performance' as TabId, label: 'Forecast Reliability', icon: ShieldCheck, tag: 'Audit' },
  { id: 'datasets' as TabId, label: 'Data Management', icon: Database, tag: 'Imports' },
  { id: 'settings' as TabId, label: 'Settings', icon: Settings, tag: 'System' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isOpen }) => {
  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#0f0f10] border-r border-[#26262a] flex flex-col transition-transform duration-200 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center gap-3 px-5 border-b border-[#26262a]">
        <div className="w-7 h-7 rounded-md bg-[#232325] border border-[#26262a] flex items-center justify-center text-[#ededed]">
          <TrendingUp className="w-4 h-4 text-[#34d399]" />
        </div>
        <div>
          <span className="font-medium text-[#ededed] text-sm tracking-tight block leading-none">
            DemandSense
          </span>
          <span className="text-[11px] text-[#71717a] block mt-1 leading-none">
            Inventory Intelligence
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-2 pb-2 text-[11px] font-medium text-[#71717a]">
          Operations
        </div>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-[#232325] text-[#ededed] border border-[#26262a]'
                  : 'text-[#a1a1a6] hover:text-[#ededed] hover:bg-[#19191b] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#ededed]' : 'text-[#71717a]'}`} />
                <span>{item.label}</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                isActive ? 'bg-[#19191b] text-[#ededed]' : 'text-[#71717a]'
              }`}>
                {item.tag}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer Status */}
      <div className="p-4 border-t border-[#26262a] text-xs text-[#71717a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]"></span>
          <span className="text-[11px] text-[#a1a1a6]">System active</span>
        </div>
        <span className="text-[10px] font-mono text-[#71717a]">v1.0</span>
      </div>
    </aside>
  );
};
