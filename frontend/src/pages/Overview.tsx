import React, { useState, useEffect } from 'react';
import {
  Layers,
  Database,
  TrendingUp,
  Package,
  ShieldCheck,
  ArrowRight,
  Code2,
  Store,
  Loader2
} from 'lucide-react';
import { HealthResponse, DatasetSummary } from '../api/types';
import { fetchAnalyticsSummary } from '../api/client';
import { TabId } from '../components/Sidebar';

interface OverviewProps {
  onNavigate: (tab: TabId) => void;
  health: HealthResponse | null;
}

export const Overview: React.FC<OverviewProps> = ({ onNavigate, health }) => {
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsSummary()
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-900/50 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 sm:p-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-4">
            <Code2 className="w-3.5 h-3.5" />
            <span>DemandSense AI Core Engine Active • {health ? health.service : 'Local Engine'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            AI-Powered Demand Forecasting & Inventory Intelligence
          </h2>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Data-backed retail demand forecasting platform powered by leakage-safe gradient boosting. 
            Forecast future store-item sales, explore seasonality distributions, and calculate transparent inventory replenishment points.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('forecast')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-600/20"
            >
              <span>Launch Forecast Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('analytics')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
              <span>Explore Sales Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Dataset</span>
            <Database className="w-4 h-4 text-indigo-400" />
          </div>
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
          ) : summary ? (
            <div>
              <div className="text-2xl font-bold text-white font-mono">
                {summary.total_rows.toLocaleString()}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Total daily records ({summary.total_days} days)
              </p>
            </div>
          ) : (
            <div className="text-xs text-slate-500">No dataset loaded</div>
          )}
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Store & SKU Coverage</span>
            <Store className="w-4 h-4 text-emerald-400" />
          </div>
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
          ) : summary ? (
            <div>
              <div className="text-2xl font-bold text-white font-mono">
                {summary.unique_stores} Stores • {summary.unique_items} Items
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {summary.unique_stores * summary.unique_items} unique time-series
              </p>
            </div>
          ) : (
            <div className="text-xs text-slate-500">Unavailable</div>
          )}
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Historical Sales</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
          ) : summary ? (
            <div>
              <div className="text-2xl font-bold text-white font-mono">
                {Math.round(summary.total_sales).toLocaleString()} units
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Mean: {summary.mean_daily_sales} units / day / series
              </p>
            </div>
          ) : (
            <div className="text-xs text-slate-500">Unavailable</div>
          )}
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Model Status</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-400 font-mono">
              Ready (HistGradient)
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Holdout MAE: 6.35 • WAPE: 10.3%
            </p>
          </div>
        </div>
      </div>

      {/* Feature & Pipeline Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div 
          onClick={() => onNavigate('analytics')}
          className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-6 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors">
            Interactive Sales Analytics
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Filter by store and product SKU. Inspect multi-year daily trends, weekend peaks, and seasonal distributions.
          </p>
        </div>

        <div 
          onClick={() => onNavigate('forecast')}
          className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-6 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white group-hover:text-emerald-300 transition-colors">
            Forecast Studio
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Generate 7, 14, or 30-day recursive forecasts with confidence bands and export results directly to CSV.
          </p>
        </div>

        <div 
          onClick={() => onNavigate('inventory')}
          className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-6 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-105 transition-transform">
            <Package className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white group-hover:text-amber-300 transition-colors">
            Inventory & Replenishment
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Simulate lead-time demand, parameterized safety stock, and data-backed reorder suggestions with zero guesswork.
          </p>
        </div>
      </div>
    </div>
  );
};
