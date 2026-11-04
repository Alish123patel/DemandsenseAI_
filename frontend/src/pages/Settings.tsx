import React from 'react';
import { Settings as SettingsIcon, Server, Shield, RefreshCw } from 'lucide-react';
import { HealthResponse } from '../api/types';
import { API_BASE_URL } from '../api/client';

interface SettingsProps {
  health: HealthResponse | null;
  healthLoading: boolean;
  healthError: string | null;
  onRefreshHealth: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  health,
  healthLoading,
  healthError,
  onRefreshHealth,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Settings & System Info</h2>
            <p className="text-xs text-slate-400">Environment configuration and runtime diagnostics</p>
          </div>
        </div>
      </div>

      {/* Backend API Configuration & Health Diagnostics */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-400" />
            <span>Backend API Connectivity</span>
          </h3>
          <button
            onClick={onRefreshHealth}
            disabled={healthLoading}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${healthLoading ? 'animate-spin' : ''}`} />
            <span>Check Connection</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
            <span className="text-slate-400 block text-[11px]">Configured API Base URL</span>
            <span className="font-mono text-indigo-300 font-medium">{API_BASE_URL}</span>
          </div>
          <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
            <span className="text-slate-400 block text-[11px]">Connection Status</span>
            {healthLoading ? (
              <span className="text-amber-400 font-medium">Checking live status...</span>
            ) : health ? (
              <span className="text-emerald-400 font-medium">Connected ({health.service} - {health.version})</span>
            ) : (
              <span className="text-rose-400 font-medium">Unavailable ({healthError || 'Network error'})</span>
            )}
          </div>
        </div>
      </div>

      {/* System Disclaimer & Operational Bounds */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-3">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400" />
          <span>Product Scope & Disclaimers</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          DemandSense AI is designed as an educational and portfolio decision-support tool. 
          Its forecasting engine generates statistical demand trajectories based strictly on historical patterns. 
          It does not guarantee future retail sales or make autonomous purchasing decisions.
        </p>
        <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-lg text-[11px] text-slate-300">
          <strong>Engineering Rules:</strong> Chronological train/test splits, no target leakage, strict lag construction, reproducible holdout evaluation.
        </div>
      </div>
    </div>
  );
};

