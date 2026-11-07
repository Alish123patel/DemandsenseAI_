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
  Loader2,
  Calendar,
  Award,
  AlertCircle
} from 'lucide-react';
import { HealthResponse, DatasetSummary, ModelInfoResponse } from '../api/types';
import { fetchAnalyticsSummary, fetchModelInfo } from '../api/client';
import { TabId } from '../components/Sidebar';

interface OverviewProps {
  onNavigate: (tab: TabId) => void;
  health: HealthResponse | null;
}

export const Overview: React.FC<OverviewProps> = ({ onNavigate, health }) => {
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.allSettled([fetchAnalyticsSummary(), fetchModelInfo()]).then(([sumRes, modelRes]) => {
      if (!isMounted) return;

      if (sumRes.status === 'fulfilled') {
        setSummary(sumRes.value);
      } else {
        setSummary(null);
      }

      if (modelRes.status === 'fulfilled') {
        setModelInfo(modelRes.value);
      } else {
        setModelInfo(null);
      }

      if (sumRes.status === 'rejected' && modelRes.status === 'rejected') {
        setError('Unable to load backend analytics or model metadata. Verify that backend is running.');
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-900/50 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 sm:p-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-4">
            <Code2 className="w-3.5 h-3.5" />
            <span>DemandSense AI Core Engine Active • {health ? `${health.service} (${health.environment})` : 'Backend Standby'}</span>
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
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <span>Launch Forecast Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('analytics')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <span>Explore Sales Analytics</span>
            </button>
            <button
              onClick={() => onNavigate('performance')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <Award className="w-4 h-4 text-indigo-400" />
              <span>Model Leaderboard</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Real Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Dataset Card */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Dataset</span>
            <Database className="w-4 h-4 text-indigo-400" />
          </div>
          {loading ? (
            <div className="flex items-center gap-2 text-slate-500 text-sm py-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Loading dataset stats...</span>
            </div>
          ) : summary ? (
            <div>
              <div className="text-2xl font-bold text-white font-mono">
                {summary.total_rows.toLocaleString()}
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>{summary.date_min} to {summary.date_max} ({summary.total_days} days)</span>
              </p>
            </div>
          ) : (
            <div className="py-2 text-xs text-slate-500">
              No active dataset loaded. Visit Dataset Management to ingest data.
            </div>
          )}
        </div>

        {/* Store & SKU Coverage Card */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Store & SKU Coverage</span>
            <Store className="w-4 h-4 text-emerald-400" />
          </div>
          {loading ? (
            <div className="flex items-center gap-2 text-slate-500 text-sm py-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Loading coverage...</span>
            </div>
          ) : summary ? (
            <div>
              <div className="text-2xl font-bold text-white font-mono">
                {summary.unique_stores} Stores • {summary.unique_items} Items
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {summary.unique_stores * summary.unique_items} unique daily series
              </p>
            </div>
          ) : (
            <div className="py-2 text-xs text-slate-500">
              Coverage metrics unavailable.
            </div>
          )}
        </div>

        {/* Historical Sales Volume Card */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Historical Sales</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          {loading ? (
            <div className="flex items-center gap-2 text-slate-500 text-sm py-2">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Loading volume...</span>
            </div>
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
            <div className="py-2 text-xs text-slate-500">
              Historical sales metrics unavailable.
            </div>
          )}
        </div>

        {/* Dynamic Model Status Card */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Production Model</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          {loading ? (
            <div className="flex items-center gap-2 text-slate-500 text-sm py-2">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>Loading model metadata...</span>
            </div>
          ) : modelInfo ? (
            <div>
              <div className="text-2xl font-bold text-emerald-400 font-mono">
                {modelInfo.model_name}
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Holdout MAE: {modelInfo.selected_metrics.test.MAE} • WAPE: {(modelInfo.selected_metrics.test.WAPE * 100).toFixed(1)}%
              </p>
            </div>
          ) : (
            <div className="py-2 text-xs text-slate-500">
              Model metadata unavailable from backend.
            </div>
          )}
        </div>
      </div>

      {/* Feature & Pipeline Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div 
          onClick={() => onNavigate('analytics')}
          className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-6 transition-all cursor-pointer group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigate('analytics'); }}
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
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigate('forecast'); }}
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
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigate('inventory'); }}
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
