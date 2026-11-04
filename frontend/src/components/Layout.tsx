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
  const activeTitle = activeItem ? activeItem.label : 'DemandSense AI';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
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

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        <footer className="py-4 px-6 border-t border-slate-900 text-center text-xs text-slate-400">
          DemandSense AI • Phase 1 Core Shell • For educational & portfolio purposes only.
        </footer>
      </div>
    </div>
  );
};

