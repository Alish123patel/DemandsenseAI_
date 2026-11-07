import React, { useState, useEffect } from 'react';
import {
  Database,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Loader2,
  Info,
  Calendar,
  Store,
  Tag,
  Hash,
  AlertCircle
} from 'lucide-react';
import { fetchAnalyticsSummary, fetchDatasetSchema, uploadDataset } from '../api/client';
import { DatasetSummary, DatasetSchemaInfo, ValidationReport } from '../api/types';

export const DatasetManagement: React.FC = () => {
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [schemaInfo, setSchemaInfo] = useState<DatasetSchemaInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [lastValidationReport, setLastValidationReport] = useState<ValidationReport | null>(null);

  const loadData = () => {
    setLoading(true);
    Promise.allSettled([fetchAnalyticsSummary(), fetchDatasetSchema()]).then(([sumRes, schemaRes]) => {
      if (sumRes.status === 'fulfilled') {
        setSummary(sumRes.value);
      }
      if (schemaRes.status === 'fulfilled') {
        setSchemaInfo(schemaRes.value);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadMessage({ text: 'Invalid file format. Please upload a .csv file.', isError: true });
      return;
    }

    setUploading(true);
    setUploadMessage(null);
    setLastValidationReport(null);

    try {
      const res = await uploadDataset(file);
      setLastValidationReport(res.report);
      if (res.success) {
        setUploadMessage({ text: res.message, isError: false });
        loadData();
      } else {
        const errorList = res.report?.errors?.length ? ` (${res.report.errors.join('; ')})` : '';
        setUploadMessage({ text: `${res.message || 'Validation failed'}${errorList}`, isError: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload error occurred';
      setUploadMessage({ text: msg, isError: true });
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    e.target.value = '';
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Dataset Management</h2>
              <p className="text-xs text-slate-400">
                CSV Schema Ingestion, Type Integrity & Canonical Data Profiling
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            Max Size: {schemaInfo?.max_upload_size_mb ?? 50} MB
          </span>
        </div>
      </div>

      {/* Schema Requirement Specification */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-400" />
            <span>Required Canonical Schema Specification</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">
            {schemaInfo?.required_columns?.length ?? 4} required columns
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/40 p-4 rounded-lg border border-slate-700/50">
            <div className="flex items-center gap-2 font-mono text-sm font-semibold text-indigo-300">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>date</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {schemaInfo?.column_descriptions?.date ?? 'ISO YYYY-MM-DD timestamp'}
            </div>
            <div className="text-[11px] text-slate-500 mt-2 font-mono">Required • Time series axis</div>
          </div>

          <div className="bg-slate-800/40 p-4 rounded-lg border border-slate-700/50">
            <div className="flex items-center gap-2 font-mono text-sm font-semibold text-indigo-300">
              <Store className="w-4 h-4 text-emerald-400" />
              <span>store</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {schemaInfo?.column_descriptions?.store ?? 'Store identifier (positive integer)'}
            </div>
            <div className="text-[11px] text-slate-500 mt-2 font-mono">Required • Store dimension</div>
          </div>

          <div className="bg-slate-800/40 p-4 rounded-lg border border-slate-700/50">
            <div className="flex items-center gap-2 font-mono text-sm font-semibold text-indigo-300">
              <Tag className="w-4 h-4 text-amber-400" />
              <span>item</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {schemaInfo?.column_descriptions?.item ?? 'Item SKU identifier (positive integer)'}
            </div>
            <div className="text-[11px] text-slate-500 mt-2 font-mono">Required • Product SKU dimension</div>
          </div>

          <div className="bg-slate-800/40 p-4 rounded-lg border border-slate-700/50">
            <div className="flex items-center gap-2 font-mono text-sm font-semibold text-indigo-300">
              <Hash className="w-4 h-4 text-cyan-400" />
              <span>sales</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {schemaInfo?.column_descriptions?.sales ?? 'Units sold on that day (numeric >= 0)'}
            </div>
            <div className="text-[11px] text-slate-500 mt-2 font-mono">Required • Target variable</div>
          </div>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed transition-all rounded-2xl p-8 text-center ${
          dragActive
            ? 'border-indigo-400 bg-indigo-950/20'
            : 'border-slate-700/70 hover:border-indigo-500/60 bg-slate-900/30'
        }`}
      >
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
            {uploading ? <Loader2 className="w-7 h-7 animate-spin" /> : <UploadCloud className="w-7 h-7" />}
          </div>
          <h4 className="text-base font-semibold text-slate-200">
            Upload & Validate Custom Sales CSV
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Drag and drop your sales CSV or click below to browse (up to {schemaInfo?.max_upload_size_mb ?? 50}MB). 
            The backend validates schema structure, date parsing, non-negative quantities, and uniqueness.
          </p>

          <div>
            <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-lg shadow-indigo-600/20 focus-within:ring-2 focus-within:ring-indigo-400">
              <FileSpreadsheet className="w-4 h-4" />
              <span>{uploading ? 'Validating Dataset...' : 'Select CSV File'}</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInputChange}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          {uploadMessage && (
            <div className={`p-3.5 rounded-lg text-xs flex items-start gap-2.5 mt-4 text-left ${
              uploadMessage.isError ? 'bg-rose-950/40 border border-rose-800 text-rose-300' : 'bg-emerald-950/40 border border-emerald-800 text-emerald-300'
            }`}>
              {uploadMessage.isError ? (
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{uploadMessage.text}</span>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Validation Report (if available after upload) */}
      {lastValidationReport && (
        <div className={`p-5 rounded-xl border ${lastValidationReport.is_valid ? 'bg-slate-900/60 border-emerald-800/60' : 'bg-rose-950/30 border-rose-800/80'} space-y-3`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-white">
              {lastValidationReport.is_valid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
              <span>Ingestion Validation Report</span>
            </span>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
              lastValidationReport.is_valid ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
            }`}>
              {lastValidationReport.is_valid ? 'Validation Passed' : 'Validation Failed'}
            </span>
          </div>

          {lastValidationReport.errors.length > 0 && (
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-rose-300">Errors Detected:</span>
              <ul className="list-disc list-inside text-xs text-rose-300/90 space-y-0.5">
                {lastValidationReport.errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {lastValidationReport.warnings.length > 0 && (
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-amber-300">Warnings:</span>
              <ul className="list-disc list-inside text-xs text-amber-300/90 space-y-0.5">
                {lastValidationReport.warnings.map((warn, idx) => (
                  <li key={idx}>{warn}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Active Ingested Dataset Profile */}
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
              <span>Active Canonical Dataset Profile</span>
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Validated • {summary.total_rows.toLocaleString()} Rows
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
      ) : (
        <div className="p-8 text-center text-slate-500 border border-slate-800 bg-slate-900/20 rounded-xl text-xs">
          No canonical dataset profile available from backend.
        </div>
      )}
    </div>
  );
};
