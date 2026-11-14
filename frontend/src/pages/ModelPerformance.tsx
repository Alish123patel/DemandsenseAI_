import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { fetchModelInfo } from '../api/client';
import { ModelInfoResponse } from '../api/types';

interface DriverItem {
  name: string;
  description: string;
  importance: number;
}

const DEMAND_DRIVERS: DriverItem[] = [
  { name: 'Weekly shopping rhythm', description: 'Weekend vs weekday customer traffic patterns', importance: 32 },
  { name: 'Same-day last week velocity', description: 'Direct 7-day sales cycle alignment', importance: 24 },
  { name: 'Previous day sales momentum', description: 'Immediate short-term demand trends', importance: 18 },
  { name: 'Monthly & seasonal cycles', description: 'Payday timing and monthly seasonality', importance: 14 },
  { name: 'Store location profile', description: 'Foot traffic differences across store branches', importance: 12 },
];

export const ModelPerformance: React.FC = () => {
  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    fetchModelInfo()
      .then(setModelInfo)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-[#71717a]">
        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#ededed]" />
        <span className="text-xs">Checking forecast reliability...</span>
      </div>
    );
  }

  if (error || !modelInfo) {
    return (
      <div className="p-4 bg-[#19191b] border border-[#26262a] rounded-lg text-xs text-[#a1a1a6] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#fbbf24] flex-shrink-0" />
          <span>Forecast reliability data currently unavailable.</span>
        </div>
        <button
          onClick={loadData}
          className="text-xs text-[#ededed] underline hover:text-white flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const testMetrics = modelInfo.selected_metrics.test;
  const overallAccuracy = ((1 - testMetrics.WAPE) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#26262a]">
        <div>
          <h1 className="text-xl font-semibold text-[#ededed] tracking-tight">Forecast Reliability</h1>
          <p className="text-xs text-[#a1a1a6] mt-0.5">
            Audit of prediction precision and expected variance across stores and products
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-[#19191b] border border-[#26262a] text-[11px] text-[#ededed] font-medium inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]"></span>
            <span>Adaptive Engine active</span>
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#19191b] border border-[#26262a] rounded-lg p-4">
          <span className="text-xs text-[#71717a] block">Reliability rate</span>
          <div className="text-2xl font-semibold text-[#34d399] font-mono tabular-nums tracking-tight mt-1">
            {overallAccuracy}%
          </div>
          <span className="text-[11px] text-[#71717a] block mt-0.5">Weighted across all SKUs</span>
        </div>

        <div className="bg-[#19191b] border border-[#26262a] rounded-lg p-4">
          <span className="text-xs text-[#71717a] block">Average daily variance</span>
          <div className="text-2xl font-semibold text-[#ededed] font-mono tabular-nums tracking-tight mt-1">
            ±{testMetrics.MAE} units
          </div>
          <span className="text-[11px] text-[#71717a] block mt-0.5">Typical daily deviation</span>
        </div>

        <div className="bg-[#19191b] border border-[#26262a] rounded-lg p-4">
          <span className="text-xs text-[#71717a] block">Peak surge variance</span>
          <div className="text-2xl font-semibold text-[#ededed] font-mono tabular-nums tracking-tight mt-1">
            ±{testMetrics.RMSE} units
          </div>
          <span className="text-[11px] text-[#71717a] block mt-0.5">High volatility cushion</span>
        </div>

        <div className="bg-[#19191b] border border-[#26262a] rounded-lg p-4">
          <span className="text-xs text-[#71717a] block">Audit window</span>
          <div className="text-2xl font-semibold text-[#ededed] font-mono tabular-nums tracking-tight mt-1">
            6 Months
          </div>
          <span className="text-[11px] text-[#71717a] block mt-0.5">Unseen holdout evaluation</span>
        </div>
      </div>

      {/* Forecasting Methods Audit Table */}
      <div className="bg-[#19191b] border border-[#26262a] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#26262a] flex items-center justify-between">
          <span className="text-xs font-medium text-[#ededed]">Forecasting Methods Audit</span>
          <span className="text-[11px] text-[#71717a] font-mono">
            Audit timeframe: {modelInfo.split_config.test_start} to {modelInfo.split_config.test_end}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-[#a1a1a6]">
            <thead className="bg-[#232325] text-[#71717a] text-[11px]">
              <tr>
                <th className="px-4 py-2.5 font-medium">Method</th>
                <th className="px-4 py-2.5 font-medium">Precision rate</th>
                <th className="px-4 py-2.5 font-medium">Average variance</th>
                <th className="px-4 py-2.5 font-medium">Peak variance</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26262a] font-mono">
              {/* Primary Active Model */}
              <tr className="bg-[#232325]/30">
                <td className="px-4 py-3 text-[#ededed] font-sans font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]"></span>
                  <span>Adaptive Pattern Engine</span>
                </td>
                <td className="px-4 py-3 text-[#34d399] font-semibold">{overallAccuracy}%</td>
                <td className="px-4 py-3 text-[#ededed]">±{testMetrics.MAE} units</td>
                <td className="px-4 py-3 text-[#a1a1a6]">±{testMetrics.RMSE} units</td>
                <td className="px-4 py-3 font-sans">
                  <span className="px-2 py-0.5 rounded bg-[#34d399]/10 text-[#34d399] text-[10px] font-medium border border-[#34d399]/20">
                    Active
                  </span>
                </td>
              </tr>

              {/* Benchmarks */}
              {Object.entries(modelInfo.benchmark_comparison || {}).map(([key, val]) => {
                const bAcc = ((1 - val.test.WAPE) * 100).toFixed(1);
                const readableName = key.includes('moving_avg') 
                  ? 'Moving Average Baseline' 
                  : key.includes('exp_smooth') 
                  ? 'Exponential Smoothing' 
                  : key;

                return (
                  <tr key={key} className="hover:bg-[#232325]/50 transition-colors">
                    <td className="px-4 py-3 text-[#a1a1a6] font-sans">{readableName}</td>
                    <td className="px-4 py-3 text-[#a1a1a6]">{bAcc}%</td>
                    <td className="px-4 py-3 text-[#71717a]">±{val.test.MAE} units</td>
                    <td className="px-4 py-3 text-[#71717a]">±{val.test.RMSE} units</td>
                    <td className="px-4 py-3 font-sans">
                      <span className="px-2 py-0.5 rounded bg-[#232325] text-[#71717a] text-[10px] font-medium border border-[#26262a]">
                        Benchmark
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Demand Drivers */}
      <div className="bg-[#19191b] border border-[#26262a] rounded-lg p-5">
        <div className="pb-3 mb-4 border-b border-[#26262a]">
          <span className="text-xs font-medium text-[#ededed]">Key Demand Drivers</span>
          <p className="text-xs text-[#71717a] mt-0.5">Primary factors influencing customer demand predictions</p>
        </div>

        <div className="space-y-3">
          {DEMAND_DRIVERS.map((driver) => (
            <div key={driver.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-[#ededed]">{driver.name}</span>
                  <span className="text-[#71717a] ml-2 text-[11px]">({driver.description})</span>
                </div>
                <span className="font-mono text-[#a1a1a6] text-[11px]">{driver.importance}% weight</span>
              </div>
              <div className="w-full bg-[#232325] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#ededed] h-full rounded-full transition-all duration-300"
                  style={{ width: `${driver.importance * 2.5}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
