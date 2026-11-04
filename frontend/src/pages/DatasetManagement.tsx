import React, { useState, useEffect } from 'react';
import { Database, UploadCloud, CheckCircle2, AlertTriangle, FileSpreadsheet, Loader2 } from 'lucide-react';
import { fetchAnalyticsSummary, uploadDataset } from '../api/client';
import { DatasetSummary } from '../api/types';

export const DatasetManagement: React.FC = () => {
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const loadSummary = () => {
    setLoading(true);
    fetchAnalyticsSummary()
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadMessage(null);
    try {
      const res = await uploadDataset(file);
      if (res.success) {
        setUploadMessage({ text: res.message, isError: false });
        loadSummary();
      } else {
        setUploadMessage({ text: res.message || 'Validation failed', isError: true });
      }
    } catch (err: any) {
      setUploadMessage({ text: err.message || 'Upload error', isError: true });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Dataset Management</h2>
            <p className="text-xs text-slate-400">
              CSV Schema Ingestion, Type Integrity & Data Profiling
            </p>
          </div>
        </div>
      </div>

      {/* Schema Requirement Specification */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
          Required Canonical Schema
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/40 p-4 rounded-lg border border-slate-700/50">
            <div className="font-mono text-sm font-semibold text-indigo-300">date</div>
            <div className="text-xs text-slate-400 mt-1">ISO YYYY-MM-DD timestamp</div>
            <div className="text-[11px] text-slate-500 mt-2">Required • Time series axis</div>
          </div>
          <div className="bg-slate-800/40 p-4 rounded-lg border border-slate-700/50">
            <div className="font-mono text-sm font-semibold text-indigo-300">store</div>
            <div className="text-xs text-slate-400 mt-1">Store identifier integer</div>
            <div className="text-[11px] text-slate-500 mt-2">Required • Store dimension</div>
          </div>
          <div className="bg-slate-800/40 p-4 rounded-lg border border-slate-700/50">
            <div className="font-mono text-sm font-semibold text-indigo-300">item</div>
            <div className="text-xs text-slate-400 mt-1">Item SKU identifier integer</div>
            <div className="text-[11px] text-slate-500 mt-2">Required • Product dimension</div>
          </div>
          <div className="bg-slate-800/40 p-4 rounded-lg border border-slate-700/50">
            <div className="font-mono text-sm font-semibold text-indigo-300">sales</div>
            <div className="text-xs text-slate-400 mt-1">Units sold daily (numeric &ge; 0)</div>
            <div className="text-[11px] text-slate-500 mt-2">Required • Target variable</div>
          </div>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div className="border-2 border-dashed border-slate-700/70 hover:border-indigo-500/60 transition-colors rounded-2xl p-8 text-center bg-slate-900/30">
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
            {uploading ? <Loader2 className="w-7 h-7 animate-spin" /> : <UploadCloud className="w-7 h-7" />}
          </div>
          <h4 className="text-base font-semibold text-slate-200">
            Upload & Validate Custom Sales CSV
          </h4>
          <p className="text-xs text-slate-400">
            Upload a CSV file conforming to the 4 required columns (up to 50MB). The backend will validate column presence, date parsing, non-negative values, and check for duplicates.
          </p>

          <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-lg shadow-indigo-600/20">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Select CSV File</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>

          {uploadMessage && (
            <div className={`p-3 rounded-lg text-xs flex items-center gap-2 mt-4 text-left ${
              uploadMessage.isError ? 'bg-rose-950/40 border border-rose-800 text-rose-300' : 'bg-emerald-950/40 border border-emerald-800 text-emerald-300'
            }`}>
              {uploadMessage.isError ? <AlertTriangle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
              <span>{uploadMessage.text}</span>
            </div>
          )}
        </div>
      </div>

      {/* Active Dataset Data Quality Report */}
      {loading ? (
        <div className="p-8 text-center text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
          <span>Loading dataset profile...</span>
        </div>
      ) : summary ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Active Dataset Profile</span>
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Validated • Complete
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-800/40 rounded border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Total Rows</span>
              <span className="text-white text-sm font-semibold">{summary.total_rows.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-slate-800/40 rounded border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Date Window</span>
              <span className="text-white text-sm font-semibold">{summary.date_min} → {summary.date_max}</span>
            </div>
            <div className="p-3 bg-slate-800/40 rounded border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Total Units Sold</span>
              <span className="text-white text-sm font-semibold">{Math.round(summary.total_sales).toLocaleString()}</span>
            </div>
            <div className="p-3 bg-slate-800/40 rounded border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Series Combinations</span>
              <span className="text-white text-sm font-semibold">{summary.unique_stores * summary.unique_items} series</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
