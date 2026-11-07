import React, { useState, useEffect } from 'react';
import {
  Package,
  Calculator,
  Info,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Store,
  Tag,
  ShieldAlert
} from 'lucide-react';
import { fetchSeriesList, fetchInventoryRecommendation } from '../api/client';
import { InventoryResponse } from '../api/types';

export const InventoryInsights: React.FC = () => {
  const [stores, setStores] = useState<number[]>([]);
  const [items, setItems] = useState<number[]>([]);
  const [selectedStore, setSelectedStore] = useState<number>(1);
  const [selectedItem, setSelectedItem] = useState<number>(1);

  const [currentStock, setCurrentStock] = useState<number>(100);
  const [leadTime, setLeadTime] = useState<number>(7);
  const [incomingStock, setIncomingStock] = useState<number>(0);
  const [safetyBufferPercent, setSafetyBufferPercent] = useState<number>(20);

  const [recommendation, setRecommendation] = useState<InventoryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
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

  const runSimulation = async () => {
    if (!selectedStore || !selectedItem) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchInventoryRecommendation({
        store: selectedStore,
        item: selectedItem,
        current_stock: currentStock,
        supplier_lead_time_days: leadTime,
        incoming_stock: incomingStock,
        safety_stock_buffer_percent: safetyBufferPercent,
      });
      setRecommendation(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Inventory simulation error';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStore && selectedItem) {
      runSimulation();
    }
  }, [selectedStore, selectedItem, currentStock, leadTime, incomingStock, safetyBufferPercent]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Inventory Intelligence & Replenishment</h2>
              <p className="text-xs text-slate-400">
                Transparent Reorder Point (ROP) & Suggested Order Quantity Simulator
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            Coupled with ML Demand Forecast
          </span>
        </div>
      </div>

      {/* Formula Transparency Card */}
      <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-5 text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2 font-semibold text-indigo-300 text-sm">
          <Info className="w-4 h-4" />
          <span>Core Inventory Replenishment Mechanics</span>
        </div>
        <p className="text-slate-400">
          Lead-time demand is dynamically integrated from the machine learning model's forecasted trajectory over the exact supplier lead time window.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 font-mono text-[11px]">
          <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg">
            <strong className="text-indigo-300">Reorder Point (ROP):</strong><br />
            <code>reorder_point = demand_during_lead_time + safety_stock</code>
          </div>
          <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg">
            <strong className="text-indigo-300">Suggested Reorder:</strong><br />
            <code>suggested_order = max(0, ROP - current_stock - incoming)</code>
          </div>
        </div>
      </div>

      {/* Simulation Inputs */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Calculator className="w-4 h-4 text-indigo-400" />
          <span>Replenishment Parameters & Scenario Config</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-1">
            <label htmlFor="inv-store" className="text-xs text-slate-400 block mb-1 flex items-center gap-1">
              <Store className="w-3 h-3 text-indigo-400" />
              <span>Store</span>
            </label>
            <select
              id="inv-store"
              value={selectedStore}
              onChange={(e) => setSelectedStore(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-indigo-500"
            >
              {stores.map((s) => (
                <option key={s} value={s}>Store {s}</option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-1">
            <label htmlFor="inv-item" className="text-xs text-slate-400 block mb-1 flex items-center gap-1">
              <Tag className="w-3 h-3 text-indigo-400" />
              <span>Product SKU</span>
            </label>
            <select
              id="inv-item"
              value={selectedItem}
              onChange={(e) => setSelectedItem(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-indigo-500"
            >
              {items.map((i) => (
                <option key={i} value={i}>Item {i}</option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-1">
            <label htmlFor="inv-stock" className="text-xs text-slate-400 block mb-1">
              On-Hand Stock
            </label>
            <input
              id="inv-stock"
              type="number"
              min="0"
              value={currentStock}
              onChange={(e) => setCurrentStock(Math.max(0, Number(e.target.value)))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="lg:col-span-1">
            <label htmlFor="inv-lead" className="text-xs text-slate-400 block mb-1">
              Lead Time (days)
            </label>
            <input
              id="inv-lead"
              type="number"
              min="1"
              max="30"
              value={leadTime}
              onChange={(e) => setLeadTime(Math.min(30, Math.max(1, Number(e.target.value))))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="lg:col-span-1">
            <label htmlFor="inv-incoming" className="text-xs text-slate-400 block mb-1">
              Incoming On-Order
            </label>
            <input
              id="inv-incoming"
              type="number"
              min="0"
              value={incomingStock}
              onChange={(e) => setIncomingStock(Math.max(0, Number(e.target.value)))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="lg:col-span-1">
            <label htmlFor="inv-buffer" className="text-xs text-slate-400 block mb-1">
              Safety Buffer (%)
            </label>
            <input
              id="inv-buffer"
              type="number"
              min="0"
              max="100"
              value={safetyBufferPercent}
              onChange={(e) => setSafetyBufferPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Output Results */}
      {loading ? (
        <div className="p-8 text-center text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
          <span>Computing inventory balance from forecast trajectory...</span>
        </div>
      ) : recommendation ? (
        <div className="space-y-6">
          {/* Status Alert Banner */}
          <div className={`p-5 rounded-xl border flex items-center justify-between flex-wrap gap-4 ${
            recommendation.reorder_recommended
              ? 'bg-amber-950/30 border-amber-800/80 text-amber-200'
              : 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
          }`}>
            <div className="flex items-center gap-3">
              {recommendation.reorder_recommended ? (
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
              <div>
                <span className="font-semibold text-base block">
                  {recommendation.reorder_recommended ? 'Reorder Recommended' : 'Inventory Position Adequate'}
                </span>
                <span className="text-xs opacity-85 block mt-0.5">
                  {recommendation.reorder_recommended
                    ? `Effective stock (${recommendation.current_stock + recommendation.incoming_stock} units) is below or equal to Reorder Point (${recommendation.reorder_point} units).`
                    : `Stock on hand (${recommendation.current_stock} units) covers expected lead-time demand plus safety buffer.`}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] uppercase font-mono block opacity-75">Suggested Reorder</span>
              <span className="text-3xl font-bold font-mono text-white">
                {Math.ceil(recommendation.suggested_order_quantity)} <span className="text-xs font-normal text-slate-400">units</span>
              </span>
            </div>
          </div>

          {/* Metric Breakdown Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <span className="text-slate-400 text-[11px] block">Lead-Time Demand</span>
              <span className="text-xl font-bold text-white font-mono">
                {recommendation.expected_demand_during_lead_time} units
              </span>
              <span className="text-[10px] text-slate-500 block mt-1 font-mono">Across {recommendation.supplier_lead_time_days} days</span>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <span className="text-slate-400 text-[11px] block">Safety Stock Buffer</span>
              <span className="text-xl font-bold text-indigo-400 font-mono">
                {recommendation.safety_stock} units
              </span>
              <span className="text-[10px] text-slate-500 block mt-1 font-mono">({recommendation.safety_stock_buffer_percent}% buffer)</span>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <span className="text-slate-400 text-[11px] block">Reorder Point (ROP)</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">
                {recommendation.reorder_point} units
              </span>
              <span className="text-[10px] text-slate-500 block mt-1 font-mono">Trigger threshold</span>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <span className="text-slate-400 text-[11px] block">Net Effective Stock</span>
              <span className="text-xl font-bold text-cyan-400 font-mono">
                {recommendation.current_stock + recommendation.incoming_stock} units
              </span>
              <span className="text-[10px] text-slate-500 block mt-1 font-mono">On-hand + Incoming</span>
            </div>
          </div>

          {/* Assumptions List */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5">
            <span className="text-xs font-semibold text-slate-300 block mb-2">
              Model Assumptions & Operational Safeguards:
            </span>
            <ul className="space-y-1.5 text-xs text-slate-400 list-disc list-inside">
              {recommendation.assumptions.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="border border-slate-800 bg-slate-900/30 rounded-xl p-10 text-center text-xs text-slate-500">
          No inventory recommendation calculated yet.
        </div>
      )}

      {/* Operational Caveat */}
      <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-center gap-2 text-xs text-amber-300">
        <ShieldAlert className="w-4 h-4 flex-shrink-0" />
        <span>Replenishment recommendations are decision-support heuristics. Always verify supplier minimum order quantities (MOQ).</span>
      </div>
    </div>
  );
};
