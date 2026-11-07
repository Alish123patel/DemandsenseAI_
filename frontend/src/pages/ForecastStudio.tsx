import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Download,
  Play,
  Loader2,
  Calendar,
  Store,
  Tag,
  AlertCircle,
  ShieldAlert,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { fetchSeriesList, fetchForecast, fetchSeriesHistory, fetchModelInfo, API_BASE_URL } from '../api/client';
import { ForecastResponse, HistoryPoint, ModelInfoResponse } from '../api/types';

interface ChartTimelinePoint {
  date: string;
  actual_sales?: number;
  predicted_sales?: number;
  lower_bound?: number;
  upper_bound?: number;
  type: 'actual' | 'forecast';
}

export const ForecastStudio: React.FC = () => {
  const [stores, setStores] = useState<number[]>([]);
  const [items, setItems] = useState<number[]>([]);
  const [selectedStore, setSelectedStore] = useState<number>(1);
  const [selectedItem, setSelectedItem] = useState<number>(1);
  const [horizon, setHorizon] = useState<7 | 14 | 30>(14);
  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);

  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [recentHistory, setRecentHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSeriesList()
      .then((data) => {
        setStores(data.stores);
        setItems(data.items);
        if (data.stores.length > 0) setSelectedStore(data.stores[0]);
        if (data.items.length > 0) setSelectedItem(data.items[0]);
      })
      .catch((err) => setError(err.message));

    fetchModelInfo()
      .then(setModelInfo)
      .catch(() => {});
  }, []);

  const handleGenerateForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const [forecastRes, historyRes] = await Promise.all([
        fetchForecast({
          store: selectedStore,
          item: selectedItem,
          horizon_days: horizon,
        }),
        fetchSeriesHistory(selectedStore, selectedItem, 14),
      ]);
      setForecast(forecastRes);
      setRecentHistory(historyRes.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Forecast generation failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    if (!forecast) return;
    setExporting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/forecast/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store: selectedStore,
          item: selectedItem,
          horizon_days: horizon,
        }),
      });

      if (!response.ok) {
        throw new Error(`Export failed with HTTP status ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `forecast_store${selectedStore}_item${selectedItem}_${horizon}d.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Export failed';
      alert(msg);
    } finally {
      setExporting(false);
    }
  };

  // Build combined chronological timeline for visualization
  const combinedChartData: ChartTimelinePoint[] = [];

  if (forecast) {
    // Add recent historical observations
    recentHistory.forEach((pt) => {
      combinedChartData.push({
        date: pt.date,
        actual_sales: pt.sales,
        type: 'actual',
      });
    });

    // Add forecast projections with bridge from the last actual point
    forecast.predictions.forEach((pred) => {
      combinedChartData.push({
        date: pred.date,
        predicted_sales: pred.predicted_sales,
        lower_bound: pred.lower_bound,
        upper_bound: pred.upper_bound,
        type: 'forecast',
      });
    });
  }

  const activeModelName = forecast?.model_name ?? modelInfo?.model_name ?? 'Production Model';
  const activeModelVersion = forecast?.model_version ?? modelInfo?.version ?? '1.0.0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Forecast Studio</h2>
              <p className="text-xs text-slate-400">
                Recursive Multi-Step Demand Projections with 95% Confidence Intervals
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            Model: {activeModelName} v{activeModelVersion}
          </span>
        </div>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
          <label htmlFor="forecast-store" className="text-xs text-slate-400 block mb-1.5 flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-indigo-400" />
            <span>Store Identifier</span>
          </label>
          <select
            id="forecast-store"
            value={selectedStore}
            onChange={(e) => setSelectedStore(Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-indigo-500"
          >
            {stores.map((s) => (
              <option key={s} value={s}>Store {s}</option>
            ))}
          </select>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
          <label htmlFor="forecast-item" className="text-xs text-slate-400 block mb-1.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-400" />
            <span>Product SKU</span>
          </label>
          <select
            id="forecast-item"
            value={selectedItem}
            onChange={(e) => setSelectedItem(Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-indigo-500"
          >
            {items.map((i) => (
              <option key={i} value={i}>Item {i}</option>
            ))}
          </select>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>Forecast Horizon</span>
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {([7, 14, 30] as const).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHorizon(h)}
                className={`py-1.5 text-xs font-medium rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                  horizon === h
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                {h}d
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col justify-end">
          <button
            onClick={handleGenerateForecast}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{loading ? 'Projecting Demand...' : 'Generate Forecast'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Forecast Output */}
      {forecast ? (
        <div className="space-y-6">
          {/* Summary Pills */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <span className="text-slate-400 text-[11px] block">Total Expected Demand</span>
              <span className="text-xl font-bold text-white font-mono">
                {forecast.total_forecasted_demand.toLocaleString()} units
              </span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <span className="text-slate-400 text-[11px] block">Mean Daily Forecast</span>
              <span className="text-xl font-bold text-indigo-400 font-mono">
                {forecast.mean_daily_forecast} units/day
              </span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <span className="text-slate-400 text-[11px] block">Forecast Window</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">
                {forecast.horizon_days} Days Ahead
              </span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[11px] block">Export Projection</span>
                <span className="text-xs text-slate-300">CSV Download</span>
              </div>
              <button
                onClick={handleExportCsv}
                disabled={exporting}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 border border-slate-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
                title="Download Forecast CSV"
                aria-label="Download Forecast CSV"
              >
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Combined Chronological History + Forecast Chart */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <h3 className="text-sm font-semibold text-white">
                Historical Context & Projected Trajectory (Store {forecast.store} • Item {forecast.item})
              </h3>
              <div className="flex items-center gap-4 text-xs font-mono flex-wrap">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 bg-slate-400 rounded-full" />
                  <span>Historical Actuals (14d)</span>
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                  <span>Forecast Projection</span>
                </span>
                <span className="flex items-center gap-1.5 text-indigo-400">
                  <span className="w-2.5 h-2.5 bg-indigo-900 border border-indigo-600 rounded-sm" />
                  <span>95% Confidence Band</span>
                </span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={combinedChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(val) => val.slice(5)}
                  />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  {/* Confidence Interval Band */}
                  <Area
                    type="monotone"
                    dataKey="upper_bound"
                    stroke="none"
                    fill="#4338ca"
                    fillOpacity={0.2}
                    name="Upper Bound (95%)"
                  />
                  <Area
                    type="monotone"
                    dataKey="lower_bound"
                    stroke="none"
                    fill="#0f172a"
                    fillOpacity={1}
                    name="Lower Bound (95%)"
                  />
                  {/* Historical Sales Line */}
                  <Line
                    type="monotone"
                    dataKey="actual_sales"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    dot={{ r: 2.5, fill: '#94a3b8' }}
                    name="Historical Sales"
                    connectNulls={false}
                  />
                  {/* Forecast Line */}
                  <Line
                    type="monotone"
                    dataKey="predicted_sales"
                    stroke="#34d399"
                    strokeWidth={2.5}
                    strokeDasharray="4 2"
                    dot={{ r: 3.5, fill: '#34d399' }}
                    name="Projected Forecast"
                    connectNulls={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Generated at: {new Date(forecast.forecast_generated_at).toLocaleString()}</span>
              </span>
              <span>Recursive Multi-Step Feature Lagging</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-slate-800 bg-slate-900/30 rounded-xl p-12 text-center">
          <div className="max-w-md mx-auto space-y-2">
            <TrendingUp className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-300">Ready to Forecast</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Select your store, SKU, and forecast window above, then click <strong>Generate Forecast</strong>. 
              The backend will load pre-trained weights and recursively project daily demand with confidence bands.
            </p>
          </div>
        </div>
      )}

      {/* Operational Disclaimer */}
      <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-center gap-2 text-xs text-amber-300">
        <ShieldAlert className="w-4 h-4 flex-shrink-0" />
        <span>DemandSense AI forecasts are data-backed statistical projections, never purchasing guarantees.</span>
      </div>
    </div>
  );
};
