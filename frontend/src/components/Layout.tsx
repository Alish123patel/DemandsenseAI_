import React, { useState } from 'react';
import { Sidebar, TabId, navigationItems } from './Sidebar';
import { Topbar } from './Topbar';
import { HealthResponse } from '../api/types';

interface LayoutProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  health: HealthResponse | null;
  healthLoading: boolean;
  healthError: string | null;
  onRefreshHealth: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  activeTab,
  onTabChange,
  health,
  healthLoading,
  healthError,
  onRefreshHealth,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeItem = navigationItems.find((item) => item.id === activeTab);
  const activeTitle = activeItem ? activeItem.label : 'DemandSense';

  return (
    <div className="min-h-screen bg-[#141415] text-[#ededed] flex flex-col lg:flex-row font-sans">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          onTabChange(tab);
          setSidebarOpen(false);
        }}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          activeTitle={activeTitle}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          health={health}
          healthLoading={healthLoading}
          healthError={healthError}
          onRefreshHealth={onRefreshHealth}
        />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        <footer className="py-4 px-6 border-t border-[#26262a] text-center text-xs text-[#71717a]">
          DemandSense • Demand Forecasting & Inventory Planning
        </footer>
      </div>
    </div>
  );
};
