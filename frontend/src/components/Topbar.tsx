import React from 'react';
import { Menu, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
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
  healthError,
  onRefreshHealth,
}) => {
  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-white tracking-tight">{activeTitle}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Backend status indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs">
          {healthLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span className="text-slate-300">Checking API...</span>
            </>
          ) : health ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300 font-medium">Backend Connected</span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                ({health.environment})
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-rose-300 font-medium">API Disconnected</span>
            </>
          )}

          <button
            onClick={onRefreshHealth}
            disabled={healthLoading}
            title="Refresh backend status"
            className="ml-1 p-0.5 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${healthLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {healthError && (
          <span className="text-[11px] text-rose-400 hidden md:inline max-w-xs truncate" title={healthError}>
            {healthError}
          </span>
        )}
      </div>
    </header>
  );
};

