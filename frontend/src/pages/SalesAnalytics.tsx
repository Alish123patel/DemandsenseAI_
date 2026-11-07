import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Store,
  Tag,
  Loader2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart as RechartsBarChart,
  Bar,
} from 'recharts';
import { fetchSeriesList, fetchSeriesHistory, fetchAnalyticsSummary } from '../api/client';
import { HistoryPoint, DatasetSummary } from '../api/types';

export const SalesAnalytics: React.FC = () => {
  const [stores, setStores] = useState<number[]>([]);
  const [items, setItems] = useState<number[]>([]);
  const [selectedStore, setSelectedStore] = useState<number>(1);
  const [selectedItem, setSelectedItem] = useState<number>(1);
  const [limit, setLimit] = useState<number>(90);

  const [historyData, setHistoryData] = useState<HistoryPoint[]>([]);
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
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

    fetchAnalyticsSummary()
      .then(setSummary)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedStore || !selectedItem) return;
    setLoading(true);
    setError(null);
    fetchSeriesHistory(selectedStore, selectedItem, limit)
      .then((res) => setHistoryData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedStore, selectedItem, limit]);

  // Transform day-of-week seasonality into array for BarChart
  const seasonalityData = summary?.seasonality?.day_of_week_mean_sales
    ? Object.entries(summary.seasonality.day_of_week_mean_sales).map(([day, val]) => ({
        day: day.slice(0, 3),
        sales: Math.round(val * 10) / 10,
      }))
    : [];

  // Calculate stats for the selected window
  const totalWindowSales = historyData.reduce((acc, pt) => acc + pt.sales, 0);
  const meanWindowSales = historyData.length > 0 ? (totalWindowSales / historyData.length).toFixed(1) : '0';
  const maxWindowSales = historyData.length > 0 ? Math.max(...historyData.map((pt) => pt.sales)) : 0;
  const minWindowSales = historyData.length > 0 ? Math.min(...historyData.map((pt) => pt.sales)) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Sales Analytics</h2>
              <p className="text-xs text-slate-400">
                Exploratory Daily Time-Series & Seasonal Pattern Visualization
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            Real Ingested History
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-indigo-400" />
            <label htmlFor="select-store" className="text-xs text-slate-400">Store:</label>
            <select
              id="select-store"
              value={selectedStore}
              onChange={(e) => setSelectedStore(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              {stores.map((s) => (
                <option key={s} value={s}>Store {s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-400" />
            <label htmlFor="select-item" className="text-xs text-slate-400">Product SKU:</label>
            <select
              id="select-item"
              value={selectedItem}
              onChange={(e) => setSelectedItem(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              {items.map((i) => (
                <option key={i} value={i}>Item {i}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <label htmlFor="select-window" className="text-xs text-slate-400">History Window:</label>
            <select
              id="select-window"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 90 Days</option>
              <option value={180}>Last 180 Days</option>
              <option value={365}>Last 365 Days</option>
            </select>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Showing: Store {selectedStore} • Item {selectedItem} ({historyData.length} pts)
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Selected Window Summary Cards */}
      {historyData.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[11px] block">Window Total</span>
            <span className="text-white text-base font-semibold">{totalWindowSales.toLocaleString()} units</span>
          </div>
          <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[11px] block">Window Daily Mean</span>
            <span className="text-indigo-300 text-base font-semibold">{meanWindowSales} units/day</span>
          </div>
          <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[11px] block">Peak Daily Sales</span>
            <span className="text-emerald-400 text-base font-semibold">{maxWindowSales} units</span>
          </div>
          <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[11px] block">Trough Daily Sales</span>
            <span className="text-amber-400 text-base font-semibold">{minWindowSales} units</span>
          </div>
        </div>
      )}

      {/* Main Historical Chart */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Daily Sales Trajectory</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Units Sold / Day</span>
        </div>

        {loading ? (
          <div className="h-72 flex items-center justify-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400 mr-2" />
            <span>Loading time-series data...</span>
          </div>
        ) : historyData.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
                  itemStyle={{ color: '#818cf8' }}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  name="Units Sold"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 flex items-center justify-center text-slate-500 text-xs">
            No historical sales records found for Store {selectedStore} and Item {selectedItem}.
          </div>
        )}
      </div>

      {/* Seasonality Chart */}
      {seasonalityData.length > 0 && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">
              Day-of-Week Seasonality (Dataset Average)
            </h3>
            <span className="text-xs text-slate-400 font-mono">Mean Units Sold</span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={seasonalityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Bar dataKey="sales" name="Mean Sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
