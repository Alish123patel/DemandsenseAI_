import React from 'react';
import { Menu, RefreshCw, Loader2 } from 'lucide-react';
import { HealthResponse } from '../api/types';

interface TopbarProps {
  activeTitle: string;
  onToggleSidebar: () => void;
  health: HealthResponse | null;
  healthLoading: boolean;
  healthError: string | null;
  onRefreshHealth: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  activeTitle,
  onToggleSidebar,
  health,
  healthLoading,
  onRefreshHealth,
}) => {
  return (
    <header className="h-14 bg-[#0f0f10]/80 backdrop-blur border-b border-[#26262a] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-md text-[#71717a] hover:text-[#ededed] hover:bg-[#232325] lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium text-[#ededed] tracking-tight">{activeTitle}</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Connection status pill */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#19191b] border border-[#26262a] text-xs">
          {healthLoading ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin text-[#fbbf24]" />
              <span className="text-[#a1a1a6] text-[11px]">Connecting</span>
            </>
          ) : health ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]"></span>
              <span className="text-[#ededed] text-[11px] font-medium">Connected</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-[#71717a]"></span>
              <span className="text-[#a1a1a6] text-[11px]">Offline</span>
            </>
          )}

          <button
            onClick={onRefreshHealth}
            disabled={healthLoading}
            title="Refresh status"
            className="text-[#71717a] hover:text-[#ededed] transition-colors disabled:opacity-50 ml-0.5"
          >
            <RefreshCw className={`w-3 h-3 ${healthLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
