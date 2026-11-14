import React from 'react';
import { RefreshCw } from 'lucide-react';
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
  onRefreshHealth,
}) => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#26262a]">
        <div>
          <h1 className="text-xl font-semibold text-[#ededed] tracking-tight">Settings & System Status</h1>
          <p className="text-xs text-[#a1a1a6] mt-0.5">
            Service connectivity, operational parameters, and system details
          </p>
        </div>
      </div>

      {/* Backend API Configuration & Health */}
      <div className="bg-[#19191b] border border-[#26262a] rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#26262a]">
          <span className="text-xs font-medium text-[#ededed]">Service Connection</span>
          <button
            onClick={onRefreshHealth}
            disabled={healthLoading}
            className="px-3 py-1.5 bg-[#ededed] hover:bg-white text-[#141415] text-xs rounded-md font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3 h-3 ${healthLoading ? 'animate-spin' : ''}`} />
            <span>Test Connection</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 bg-[#232325] rounded border border-[#26262a]">
            <span className="text-[#71717a] block text-[10px] mb-1 font-sans">API Endpoint</span>
            <span className="text-[#ededed]">{API_BASE_URL}</span>
          </div>

          <div className="p-3 bg-[#232325] rounded border border-[#26262a]">
            <span className="text-[#71717a] block text-[10px] mb-1 font-sans">Status</span>
            {healthLoading ? (
              <span className="text-[#fbbf24]">Checking connection...</span>
            ) : health ? (
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]"></span>
                <span className="text-[#34d399]">Connected (v{health.version})</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#71717a]"></span>
                <span className="text-[#a1a1a6]">Offline / Standby</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Operational Principles */}
      <div className="bg-[#19191b] border border-[#26262a] rounded-lg p-5 space-y-3">
        <span className="text-xs font-medium text-[#ededed] block">Data Reliability Principles</span>
        <p className="text-xs text-[#a1a1a6] leading-relaxed">
          DemandSense AI provides data-driven decision support for store managers and inventory analysts. Forecast projections and replenishment triggers are calculated with strict data hygiene:
        </p>
        <div className="space-y-2 pt-1 text-xs text-[#a1a1a6]">
          <div className="p-2.5 bg-[#232325] rounded border border-[#26262a]">
            <strong className="text-[#ededed] font-medium block">Chronological Integrity:</strong>
            <span>Evaluations and forecasts prevent future lookahead leakage, ensuring simulations reflect real-world forecasting conditions.</span>
          </div>
          <div className="p-2.5 bg-[#232325] rounded border border-[#26262a]">
            <strong className="text-[#ededed] font-medium block">Uncertainty Bounds:</strong>
            <span>All demand projections output 95% confidence intervals to ensure safety buffers account for customer demand variance.</span>
          </div>
          <div className="p-2.5 bg-[#232325] rounded border border-[#26262a]">
            <strong className="text-[#ededed] font-medium block">Local Execution:</strong>
            <span>All computation and model evaluations run locally on your dedicated instance without external third-party data transmission.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
