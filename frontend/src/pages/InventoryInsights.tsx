import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Loader2,
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
      const msg = err instanceof Error ? err.message : 'Inventory calculation error';
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#26262a]">
        <div>
          <h1 className="text-xl font-semibold text-[#ededed] tracking-tight">Restock Planner</h1>
          <p className="text-xs text-[#a1a1a6] mt-0.5">
            Automated order calculations to prevent stockouts and avoid over-ordering
          </p>
        </div>
      </div>

      {/* Parameter Inputs */}
      <div className="bg-[#19191b] border border-[#26262a] rounded-lg p-5 space-y-4">
        <div className="text-xs font-medium text-[#ededed]">
          Inventory parameters
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label htmlFor="inv-store" className="text-xs text-[#a1a1a6] block mb-1.5 font-medium">
              Store location
            </label>
            <select
              id="inv-store"
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
            <label htmlFor="inv-item" className="text-xs text-[#a1a1a6] block mb-1.5 font-medium">
              Product SKU
            </label>
            <select
              id="inv-item"
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
            <label htmlFor="inv-stock" className="text-xs text-[#a1a1a6] block mb-1.5 font-medium">
              On-hand stock
            </label>
            <input
              id="inv-stock"
              type="number"
              min="0"
              value={currentStock}
              onChange={(e) => setCurrentStock(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-[#232325] border border-[#26262a] text-xs text-[#ededed] font-mono rounded-md px-3 py-2 focus:outline-none focus:border-[#3f3f46]"
            />
          </div>

          <div>
            <label htmlFor="inv-lead" className="text-xs text-[#a1a1a6] block mb-1.5 font-medium">
              Lead time (days)
            </label>
            <input
              id="inv-lead"
              type="number"
              min="1"
              max="60"
              value={leadTime}
              onChange={(e) => setLeadTime(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-[#232325] border border-[#26262a] text-xs text-[#ededed] font-mono rounded-md px-3 py-2 focus:outline-none focus:border-[#3f3f46]"
            />
          </div>

          <div>
            <label htmlFor="inv-incoming" className="text-xs text-[#a1a1a6] block mb-1.5 font-medium">
              Incoming delivery
            </label>
            <input
              id="inv-incoming"
              type="number"
              min="0"
              value={incomingStock}
              onChange={(e) => setIncomingStock(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-[#232325] border border-[#26262a] text-xs text-[#ededed] font-mono rounded-md px-3 py-2 focus:outline-none focus:border-[#3f3f46]"
            />
          </div>

          <div>
            <label htmlFor="inv-buffer" className="text-xs text-[#a1a1a6] block mb-1.5 font-medium">
              Safety cushion (%)
            </label>
            <input
              id="inv-buffer"
              type="number"
              min="0"
              max="100"
              value={safetyBufferPercent}
              onChange={(e) => setSafetyBufferPercent(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-[#232325] border border-[#26262a] text-xs text-[#ededed] font-mono rounded-md px-3 py-2 focus:outline-none focus:border-[#3f3f46]"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-[#19191b] border border-[#26262a] rounded-lg text-xs text-[#a1a1a6] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#fbbf24] flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Recommendation Card */}
      {loading ? (
        <div className="p-10 text-center bg-[#19191b] border border-[#26262a] rounded-lg text-xs text-[#71717a] flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#ededed]" />
          <span>Calculating replenishment metrics...</span>
        </div>
      ) : recommendation ? (
        <div className="space-y-6">
          {/* Main Status Hero Card */}
          <div className="bg-[#19191b] border border-[#26262a] rounded-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#26262a]">
              <div>
                <span className="text-xs text-[#71717a] uppercase tracking-wider block font-mono">Recommendation</span>
                <h2 className="text-lg font-semibold text-[#ededed] mt-0.5">
                  Store #{recommendation.store} • SKU #{recommendation.item}
                </h2>
              </div>

              <div>
                {recommendation.reorder_recommended ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/20 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24]"></span>
                    <span>Reorder Needed</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/20 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]"></span>
                    <span>Sufficient Stock</span>
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              <div>
                <span className="text-xs text-[#71717a] block">Recommended order</span>
                <div className="text-3xl font-semibold text-[#ededed] font-mono tabular-nums tracking-tight mt-1">
                  {recommendation.suggested_order_quantity.toLocaleString()} units
                </div>
                <span className="text-[11px] text-[#71717a] block mt-0.5">
                  {recommendation.suggested_order_quantity > 0 ? 'To restore safe inventory buffer' : 'Stock level is adequate'}
                </span>
              </div>

              <div>
                <span className="text-xs text-[#71717a] block">Expected demand</span>
                <div className="text-3xl font-semibold text-[#ededed] font-mono tabular-nums tracking-tight mt-1">
                  {recommendation.expected_demand_during_lead_time} units
                </div>
                <span className="text-[11px] text-[#71717a] block mt-0.5">
                  During {recommendation.supplier_lead_time_days}-day lead time
                </span>
              </div>

              <div>
                <span className="text-xs text-[#71717a] block">Restock trigger point (ROP)</span>
                <div className="text-3xl font-semibold text-[#ededed] font-mono tabular-nums tracking-tight mt-1">
                  {recommendation.reorder_point} units
                </div>
                <span className="text-[11px] text-[#71717a] block mt-0.5">
                  Demand + {recommendation.safety_stock} unit safety buffer
                </span>
              </div>

              <div>
                <span className="text-xs text-[#71717a] block">Net available stock</span>
                <div className="text-3xl font-semibold text-[#ededed] font-mono tabular-nums tracking-tight mt-1">
                  {recommendation.current_stock + recommendation.incoming_stock} units
                </div>
                <span className="text-[11px] text-[#71717a] block mt-0.5">
                  {recommendation.current_stock} on hand + {recommendation.incoming_stock} incoming
                </span>
              </div>
            </div>
          </div>

          {/* Logic & Assumptions */}
          <div className="bg-[#19191b] border border-[#26262a] rounded-lg p-5">
            <span className="text-xs font-medium text-[#ededed] block mb-2">Calculation method</span>
            <p className="text-xs text-[#a1a1a6] leading-relaxed mb-3">
              The restock threshold (ROP) combines predicted customer demand across your supplier lead time with a safety cushion for sales spikes. An order is recommended whenever on-hand stock plus inbound orders drops below this threshold.
            </p>
            <div className="space-y-1.5 pt-2 border-t border-[#26262a]">
              {recommendation.assumptions.map((item, idx) => (
                <div key={idx} className="text-[11px] text-[#71717a] flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#71717a]"></span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
