import React, { useState, useEffect } from 'react';
import { Award, CheckCircle, Info, Loader2 } from 'lucide-react';
import { fetchModelInfo } from '../api/client';
import { ModelInfoResponse } from '../api/types';

export const ModelPerformance: React.FC = () => {
  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchModelInfo()
      .then(setModelInfo)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-400" />
        <span>Loading model performance benchmarks...</span>
      </div>
    );
  }

  if (error || !modelInfo) {
    return (
      <div className="p-6 bg-rose-950/40 border border-rose-800 rounded-xl text-rose-300 text-sm">
        Failed to load model evaluation metadata: {error}
      </div>
    );
  }

  const testMetrics = modelInfo.selected_metrics.test;
  const comparison = modelInfo.benchmark_comparison;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Model Evaluation & Benchmark Leaderboard</h2>
              <p className="text-xs text-slate-400">
                Rigorous Chronological Holdout Validation (Zero Leakage Protocol)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Selected: {modelInfo.model_name}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Test Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <span className="text-slate-400 text-xs block mb-1">Holdout MAE</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {testMetrics.MAE}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Units sold per day</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <span className="text-slate-400 text-xs block mb-1">Holdout RMSE</span>
          <div className="text-2xl font-bold text-white font-mono">
            {testMetrics.RMSE}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Root Mean Squared Error</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <span className="text-slate-400 text-xs block mb-1">WAPE</span>
          <div className="text-2xl font-bold text-indigo-400 font-mono">
            {(testMetrics.WAPE * 100).toFixed(2)}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Weighted Abs % Error</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <span className="text-slate-400 text-xs block mb-1">sMAPE</span>
          <div className="text-2xl font-bold text-cyan-400 font-mono">
            {testMetrics.sMAPE}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Symmetric MAPE</span>
        </div>
      </div>

      {/* Benchmark Leaderboard Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Model Architecture Benchmark Leaderboard (Holdout Period)
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Chronological Split: 2017-07-01 to 2017-12-31
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Candidate Model</th>
                <th className="px-4 py-3">Validation MAE</th>
                <th className="px-4 py-3">Test MAE</th>
                <th className="px-4 py-3">Test RMSE</th>
                <th className="px-4 py-3">Test WAPE</th>
                <th className="px-4 py-3">Test sMAPE</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {Object.entries(comparison).map(([name, res]) => {
                const isSelected = name === modelInfo.model_name;
                return (
                  <tr key={name} className={isSelected ? 'bg-indigo-950/20' : ''}>
                    <td className="px-4 py-3 font-medium text-slate-200 flex items-center gap-2">
                      {isSelected && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                      <span>{name}</span>
                    </td>
                    <td className="px-4 py-3 font-mono">{res.val.MAE}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-indigo-300">{res.test.MAE}</td>
                    <td className="px-4 py-3 font-mono">{res.test.RMSE}</td>
                    <td className="px-4 py-3 font-mono">{(res.test.WAPE * 100).toFixed(2)}%</td>
                    <td className="px-4 py-3 font-mono">{res.test.sMAPE}%</td>
                    <td className="px-4 py-3">
                      {isSelected ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                          Production Model
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-500">
                          Baseline / Evaluated
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Split Details & Feature Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Chronological Split Protocol
          </h3>
          <div className="space-y-2 text-xs font-mono text-slate-300">
            <div className="flex justify-between p-2 rounded bg-slate-800/40 border border-slate-800">
              <span className="text-slate-400">Training Period:</span>
              <span>2013-01-01 → {modelInfo.split_config.train_end} (4.0 years)</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-800/40 border border-slate-800">
              <span className="text-slate-400">Validation Period:</span>
              <span>{modelInfo.split_config.val_start} → {modelInfo.split_config.val_end} (6 months)</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-800/40 border border-slate-800">
              <span className="text-slate-400">Holdout Test Period:</span>
              <span>{modelInfo.split_config.test_start} → {modelInfo.split_config.test_end} (6 months)</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Engineered Feature Inputs ({modelInfo.feature_columns.length} features)
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {modelInfo.feature_columns.map((f) => (
              <span key={f} className="text-[11px] font-mono px-2 py-1 rounded bg-slate-800/70 border border-slate-700/60 text-slate-300">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Limitations Card */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
          <Info className="w-4 h-4" />
          <span>Intended Operational Context & Limitations</span>
        </div>
        <ul className="space-y-1 text-xs text-slate-400 list-disc list-inside">
          {modelInfo.limitations.map((l, idx) => (
            <li key={idx}>{l}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
