import React, { useState, useEffect } from 'react';
import {
  Loader2,
  AlertCircle,
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
  Cell,
} from 'recharts';
import { fetchSeriesList, fetchSeriesHistory, fetchAnalyticsSummary } from '../api/client';
import { HistoryPoint, DatasetSummary } from '../api/types';

const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

  const seasonalityData = summary?.seasonality?.day_of_week_mean_sales
    ? Object.entries(summary.seasonality.day_of_week_mean_sales).map(([dayIdx, val]) => ({
        day: DAY_LABELS[Number(dayIdx)] || `Day ${dayIdx}`,
        sales: Math.round(val * 10) / 10,
      }))
    : [];

  const maxSeasonalitySales = seasonalityData.length > 0 ? Math.max(...seasonalityData.map((d) => d.sales)) : 0;

  const totalWindowSales = historyData.reduce((acc, pt) => acc + pt.sales, 0);
  const meanWindowSales = historyData.length > 0 ? (totalWindowSales / historyData.length).toFixed(1) : '0';
  const maxWindowSales = historyData.length > 0 ? Math.max(...historyData.map((pt) => pt.sales)) : 0;
  const minWindowSales = historyData.length > 0 ? Math.min(...historyData.map((pt) => pt.sales)) : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#26262a]">
        <div>
          <h1 className="text-xl font-semibold text-[#ededed] tracking-tight">Sales Trends</h1>
          <p className="text-xs text-[#a1a1a6] mt-0.5">
            Historical sales trajectory and weekly purchasing patterns
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#19191b] border border-[#26262a] rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="select-store" className="text-xs font-medium text-[#a1a1a6] block mb-1.5">
              Store location
            </label>
            <select
              id="select-store"
              value={selectedStore}
              onChange={(e) => setSelectedStore(Number(e.target.value))}
              className="w-full bg-[#232325] border border-[#26262a] text-xs text-[#ededed] rounded-md px-3 py-2 focus:outline-none focus:border-[#3f3f46]"
            >
              {stores.map((s) => (
                <option key={s} value={s}>Store #{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="select-item" className="text-xs font-medium text-[#a1a1a6] block mb-1.5">
              Product SKU
            </label>
            <select
              id="select-item"
              value={selectedItem}
              onChange={(e) => setSelectedItem(Number(e.target.value))}
              className="w-full bg-[#232325] border border-[#26262a] text-xs text-[#ededed] rounded-md px-3 py-2 focus:outline-none focus:border-[#3f3f46]"
            >
              {items.map((i) => (
                <option key={i} value={i}>Product SKU #{i}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="select-window" className="text-xs font-medium text-[#a1a1a6] block mb-1.5">
              Timeframe
            </label>
            <select
              id="select-window"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full bg-[#232325] border border-[#26262a] text-xs text-[#ededed] rounded-md px-3 py-2 focus:outline-none focus:border-[#3f3f46]"
            >
              <option value={30}>Last 30 Days</option>
              <option value={60}>Last 60 Days</option>
              <option value={90}>Last 90 Days</option>
              <option value={180}>Last 180 Days</option>
              <option value={365}>Last 365 Days</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-[#19191b] border border-[#26262a] rounded-lg text-xs text-[#a1a1a6] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#fbbf24] flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#19191b] border border-[#26262a] rounded-lg p-4">
          <span className="text-xs text-[#71717a] block">Period sales volume</span>
          <div className="text-2xl font-semibold text-[#ededed] font-mono tabular-nums tracking-tight mt-1">
            {totalWindowSales.toLocaleString()} units
          </div>
          <span className="text-[11px] text-[#71717a] block mt-0.5">Across {historyData.length} days</span>
        </div>

        <div className="bg-[#19191b] border border-[#26262a] rounded-lg p-4">
          <span className="text-xs text-[#71717a] block">Average daily sales</span>
          <div className="text-2xl font-semibold text-[#ededed] font-mono tabular-nums tracking-tight mt-1">
            {meanWindowSales} units
          </div>
          <span className="text-[11px] text-[#71717a] block mt-0.5">Daily mean velocity</span>
        </div>

        <div className="bg-[#19191b] border border-[#26262a] rounded-lg p-4">
          <span className="text-xs text-[#71717a] block">Period peak</span>
          <div className="text-2xl font-semibold text-[#ededed] font-mono tabular-nums tracking-tight mt-1">
            {maxWindowSales} units
          </div>
          <span className="text-[11px] text-[#71717a] block mt-0.5">Highest recorded day</span>
        </div>

        <div className="bg-[#19191b] border border-[#26262a] rounded-lg p-4">
          <span className="text-xs text-[#71717a] block">Period low</span>
          <div className="text-2xl font-semibold text-[#ededed] font-mono tabular-nums tracking-tight mt-1">
            {minWindowSales} units
          </div>
          <span className="text-[11px] text-[#71717a] block mt-0.5">Lowest recorded day</span>
        </div>
      </div>

      {/* Historical Sales Trajectory Chart */}
      <div className="bg-[#19191b] border border-[#26262a] rounded-lg p-5">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#26262a]">
          <div>
            <span className="text-xs font-medium text-[#ededed]">Sales History</span>
            <span className="text-xs text-[#71717a] ml-2">Store #{selectedStore} • SKU #{selectedItem}</span>
          </div>
          <span className="text-[11px] font-mono text-[#71717a]">{historyData.length} daily points</span>
        </div>

        {loading ? (
          <div className="h-72 flex items-center justify-center text-xs text-[#71717a] gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#ededed]" />
            <span>Loading history...</span>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#26262a" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#71717a"
                  tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  tickFormatter={(val) => val.slice(5)}
                />
                <YAxis
                  stroke="#71717a"
                  tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f0f10',
                    borderColor: '#26262a',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: '#ededed',
                    fontFamily: 'JetBrains Mono',
                  }}
                  formatter={(value: any) => [`${value} units`, 'Sales']}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#ededed"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Weekday Seasonality */}
      <div className="bg-[#19191b] border border-[#26262a] rounded-lg p-5">
        <div className="pb-3 mb-4 border-b border-[#26262a]">
          <span className="text-xs font-medium text-[#ededed]">Day-of-Week Sales Volume</span>
          <p className="text-xs text-[#71717a] mt-0.5">Average customer purchase units by day of week across all store history</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={seasonalityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#26262a" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="day"
                stroke="#71717a"
                tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'Inter' }}
              />
              <YAxis
                stroke="#71717a"
                tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f0f10',
                  borderColor: '#26262a',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#ededed',
                  fontFamily: 'JetBrains Mono',
                }}
                formatter={(value: any) => [`${value} avg units/day`, 'Mean Volume']}
              />
              <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
                {seasonalityData.map((entry, index) => {
                  const isPeak = entry.sales === maxSeasonalitySales;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={isPeak ? '#34d399' : '#232325'}
                      stroke={isPeak ? '#34d399' : '#26262a'}
                    />
                  );
                })}
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
