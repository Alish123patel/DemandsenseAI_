import React, { useState, useEffect } from 'react';
import {
  Download,
  Loader2,
  AlertCircle,
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
import { fetchSeriesList, fetchForecast, fetchSeriesHistory, API_BASE_URL } from '../api/client';
import { ForecastResponse, HistoryPoint } from '../api/types';

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
      const msg = err instanceof Error ? err.message : 'Unable to generate forecast.';
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
        throw new Error('Export failed. Please try again.');
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
    recentHistory.forEach((pt) => {
      combinedChartData.push({
        date: pt.date,
        actual_sales: pt.sales,
        type: 'actual',
      });
    });

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#26262a]">
        <div>
          <h1 className="text-xl font-semibold text-[#ededed] tracking-tight">Demand Forecast</h1>
          <p className="text-xs text-[#a1a1a6] mt-0.5">
            Projected customer demand with confidence intervals
          </p>
        </div>

        {forecast && (
          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="px-3 py-1.5 bg-[#232325] hover:bg-[#2a2a2e] text-[#ededed] border border-[#26262a] rounded-md text-xs font-medium transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-[#a1a1a6]" />}
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {/* Control Toolbar */}
      <div className="bg-[#19191b] border border-[#26262a] rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="forecast-store" className="text-xs font-medium text-[#a1a1a6] block mb-1.5">
              Store location
            </label>
            <select
              id="forecast-store"
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
            <label htmlFor="forecast-item" className="text-xs font-medium text-[#a1a1a6] block mb-1.5">
              Product SKU
            </label>
            <select
              id="forecast-item"
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
            <span className="text-xs font-medium text-[#a1a1a6] block mb-1.5">
              Forecast horizon
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {([7, 14, 30] as const).map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHorizon(h)}
                  className={`py-1.5 text-xs font-medium rounded-md border transition-colors ${
                    horizon === h
                      ? 'bg-[#232325] text-[#ededed] border-[#3f3f46]'
                      : 'bg-[#19191b] text-[#71717a] border-[#26262a] hover:text-[#ededed]'
                  }`}
                >
                  {h}d
                </button>
              ))}
            </div>
          </div>

          <div>
            <button
              onClick={handleGenerateForecast}
              disabled={loading}
              className="w-full py-2 px-4 bg-[#ededed] hover:bg-white text-[#141415] rounded-md text-xs font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Calculating...</span>
                </>
              ) : (
                <span>Generate forecast</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-[#19191b] border border-[#26262a] rounded-lg text-xs text-[#a1a1a6] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#fbbf24] flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Output Display */}
      {forecast ? (
        <div className="space-y-6">
          {/* Summary Figures */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#19191b] border border-[#26262a] rounded-lg p-4">
              <span className="text-xs text-[#71717a] block">Total expected volume</span>
              <div className="text-2xl font-semibold text-[#ededed] font-mono tabular-nums tracking-tight mt-1">
                {forecast.total_forecasted_demand.toLocaleString()} units
              </div>
              <span className="text-[11px] text-[#71717a] block mt-0.5">Over {forecast.horizon_days} days</span>
            </div>

            <div className="bg-[#19191b] border border-[#26262a] rounded-lg p-4">
              <span className="text-xs text-[#71717a] block">Average daily demand</span>
              <div className="text-2xl font-semibold text-[#ededed] font-mono tabular-nums tracking-tight mt-1">
                {forecast.mean_daily_forecast} units
              </div>
              <span className="text-[11px] text-[#71717a] block mt-0.5">Mean per day</span>
            </div>

            <div className="bg-[#19191b] border border-[#26262a] rounded-lg p-4">
              <span className="text-xs text-[#71717a] block">Peak projected day</span>
              <div className="text-2xl font-semibold text-[#ededed] font-mono tabular-nums tracking-tight mt-1">
                {Math.max(...forecast.predictions.map((p) => p.predicted_sales))} units
              </div>
              <span className="text-[11px] text-[#71717a] block mt-0.5">High volume day</span>
            </div>

            <div className="bg-[#19191b] border border-[#26262a] rounded-lg p-4">
              <span className="text-xs text-[#71717a] block">Lowest projected day</span>
              <div className="text-2xl font-semibold text-[#ededed] font-mono tabular-nums tracking-tight mt-1">
                {Math.min(...forecast.predictions.map((p) => p.predicted_sales))} units
              </div>
              <span className="text-[11px] text-[#71717a] block mt-0.5">Low volume day</span>
            </div>
          </div>

          {/* Forecast Chart */}
          <div className="bg-[#19191b] border border-[#26262a] rounded-lg p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 pb-3 border-b border-[#26262a]">
              <div>
                <span className="text-xs font-medium text-[#ededed]">Demand Trajectory</span>
                <span className="text-xs text-[#71717a] ml-2">Store #{selectedStore} • SKU #{selectedItem}</span>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-[#a1a1a6]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-[#71717a]"></span>
                  <span>Historical actuals</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-[#ededed]"></span>
                  <span>Forecast projection</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-[#38bdf8]/20 border border-[#38bdf8]/40 rounded-sm"></span>
                  <span>95% Range</span>
                </div>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={combinedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    formatter={(value: any, name?: any) => {
                      if (name === 'predicted_sales') return [`${value} units`, 'Projected'];
                      if (name === 'actual_sales') return [`${value} units`, 'Actual'];
                      if (name === 'upper_bound') return [`${value} units`, 'Upper range'];
                      if (name === 'lower_bound') return [`${value} units`, 'Lower range'];
                      return [value, String(name ?? '')];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="upper_bound"
                    stroke="none"
                    fill="#38bdf8"
                    fillOpacity={0.08}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual_sales"
                    stroke="#71717a"
                    strokeWidth={1.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted_sales"
                    stroke="#ededed"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table Breakdown */}
          <div className="bg-[#19191b] border border-[#26262a] rounded-lg overflow-hidden">
            <div className="p-4 border-b border-[#26262a] flex items-center justify-between">
              <span className="text-xs font-medium text-[#ededed]">Day-by-Day Forecast Breakdown</span>
              <span className="text-[11px] text-[#71717a] font-mono">{forecast.predictions.length} daily periods</span>
            </div>

            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-xs text-left text-[#a1a1a6]">
                <thead className="bg-[#232325] text-[#71717a] text-[11px] sticky top-0">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Date</th>
                    <th className="px-4 py-2.5 font-medium">Projected sales</th>
                    <th className="px-4 py-2.5 font-medium">Expected range</th>
                    <th className="px-4 py-2.5 font-medium">Relative change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#26262a] font-mono">
                  {forecast.predictions.map((p, idx) => {
                    const prev = idx > 0 ? forecast.predictions[idx - 1].predicted_sales : p.predicted_sales;
                    const diff = p.predicted_sales - prev;
                    return (
                      <tr key={p.date} className="hover:bg-[#232325]/50 transition-colors">
                        <td className="px-4 py-2.5 text-[#ededed]">{p.date}</td>
                        <td className="px-4 py-2.5 text-[#ededed] font-semibold">{p.predicted_sales} units</td>
                        <td className="px-4 py-2.5 text-[#71717a]">
                          {p.lower_bound} – {p.upper_bound} units
                        </td>
                        <td className="px-4 py-2.5">
                          {diff > 0 ? (
                            <span className="text-[#34d399]">+{diff} units</span>
                          ) : diff < 0 ? (
                            <span className="text-[#a1a1a6]">{diff} units</span>
                          ) : (
                            <span className="text-[#71717a]">steady</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-[#19191b] border border-[#26262a] rounded-lg">
          <p className="text-xs text-[#a1a1a6]">Select a store and SKU above, then click &ldquo;Generate forecast&rdquo;.</p>
        </div>
      )}
    </div>
  );
};
