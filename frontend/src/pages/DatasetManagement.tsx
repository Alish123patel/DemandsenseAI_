import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { fetchAnalyticsSummary, fetchDatasetSchema, uploadDataset } from '../api/client';
import { DatasetSummary, DatasetSchemaInfo, ValidationReport } from '../api/types';

export const DatasetManagement: React.FC = () => {
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [schemaInfo, setSchemaInfo] = useState<DatasetSchemaInfo | null>(null);
  const [, setLoading] = useState<boolean>(true);
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
      setUploadMessage({ text: 'Please upload a CSV file (.csv).', isError: true });
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
      const msg = err instanceof Error ? err.message : 'Upload failed.';
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#26262a]">
        <div>
          <h1 className="text-xl font-semibold text-[#ededed] tracking-tight">Data Management</h1>
          <p className="text-xs text-[#a1a1a6] mt-0.5">
            Import, validate, and inspect sales datasets
          </p>
        </div>

        <span className="text-[11px] font-mono text-[#71717a] px-2.5 py-1 rounded bg-[#19191b] border border-[#26262a]">
          Max file size: {schemaInfo?.max_upload_size_mb ?? 50} MB
        </span>
      </div>

      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`bg-[#19191b] border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-[#ededed] bg-[#232325]'
            : 'border-[#26262a] hover:border-[#3f3f46]'
        }`}
      >
        <div className="w-10 h-10 rounded-md bg-[#232325] border border-[#26262a] mx-auto flex items-center justify-center text-[#ededed] mb-3">
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <UploadCloud className="w-5 h-5 text-[#a1a1a6]" />
          )}
        </div>

        <div className="text-xs font-medium text-[#ededed]">
          {uploading ? 'Validating spreadsheet data...' : 'Drop CSV spreadsheet here, or browse'}
        </div>
        <p className="text-xs text-[#71717a] mt-1 mb-4">
          Columns required: date, store, item, sales
        </p>

        <label className="inline-flex">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileInputChange}
            disabled={uploading}
            className="hidden"
          />
          <span className="px-3 py-1.5 bg-[#ededed] hover:bg-white text-[#141415] rounded-md text-xs font-medium cursor-pointer transition-colors">
            Select CSV file
          </span>
        </label>
      </div>

      {/* Upload Feedback Message */}
      {uploadMessage && (
        <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
          uploadMessage.isError
            ? 'bg-[#19191b] border-[#fbbf24]/40 text-[#fbbf24]'
            : 'bg-[#19191b] border-[#34d399]/40 text-[#34d399]'
        }`}>
          {uploadMessage.isError ? (
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{uploadMessage.text}</span>
        </div>
      )}

      {/* Validation Report Details */}
      {lastValidationReport && (
        <div className="bg-[#19191b] border border-[#26262a] rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#26262a]">
            <span className="text-xs font-medium text-[#ededed]">Validation Report</span>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
              lastValidationReport.is_valid 
                ? 'bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/20'
                : 'bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/20'
            }`}>
              {lastValidationReport.is_valid ? 'Valid CSV' : 'Validation Issues'}
            </span>
          </div>

          {lastValidationReport.stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 bg-[#232325] rounded border border-[#26262a]">
                <span className="text-[#71717a] block text-[10px]">Rows</span>
                <span className="text-[#ededed] font-semibold">{lastValidationReport.stats.total_rows?.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-[#232325] rounded border border-[#26262a]">
                <span className="text-[#71717a] block text-[10px]">Stores</span>
                <span className="text-[#ededed] font-semibold">{lastValidationReport.stats.unique_stores}</span>
              </div>
              <div className="p-2.5 bg-[#232325] rounded border border-[#26262a]">
                <span className="text-[#71717a] block text-[10px]">SKUs</span>
                <span className="text-[#ededed] font-semibold">{lastValidationReport.stats.unique_items}</span>
              </div>
              <div className="p-2.5 bg-[#232325] rounded border border-[#26262a]">
                <span className="text-[#71717a] block text-[10px]">Days</span>
                <span className="text-[#ededed] font-semibold">{lastValidationReport.stats.total_days}</span>
              </div>
            </div>
          )}

          {lastValidationReport.errors.length > 0 && (
            <div className="p-3 bg-[#232325] rounded border border-[#26262a] text-xs text-[#fbbf24] space-y-1">
              <strong className="block">Errors:</strong>
              {lastValidationReport.errors.map((err, i) => (
                <div key={i}>• {err}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Required Columns Schema */}
      <div className="bg-[#19191b] border border-[#26262a] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#26262a] flex items-center justify-between">
          <span className="text-xs font-medium text-[#ededed]">Required Spreadsheet Columns</span>
          <span className="text-[11px] text-[#71717a]">All 4 columns mandatory</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-[#a1a1a6]">
            <thead className="bg-[#232325] text-[#71717a] text-[11px]">
              <tr>
                <th className="px-4 py-2.5 font-medium">Column name</th>
                <th className="px-4 py-2.5 font-medium">Format</th>
                <th className="px-4 py-2.5 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26262a] font-mono">
              <tr>
                <td className="px-4 py-2.5 text-[#ededed] font-semibold">date</td>
                <td className="px-4 py-2.5 text-[#71717a]">YYYY-MM-DD</td>
                <td className="px-4 py-2.5 font-sans text-[#a1a1a6]">Transaction record date</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-[#ededed] font-semibold">store</td>
                <td className="px-4 py-2.5 text-[#71717a]">Integer ID (1..10)</td>
                <td className="px-4 py-2.5 font-sans text-[#a1a1a6]">Store location identifier</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-[#ededed] font-semibold">item</td>
                <td className="px-4 py-2.5 text-[#71717a]">Integer ID (1..50)</td>
                <td className="px-4 py-2.5 font-sans text-[#a1a1a6]">Product item SKU identifier</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-[#ededed] font-semibold">sales</td>
                <td className="px-4 py-2.5 text-[#71717a]">Integer &ge; 0</td>
                <td className="px-4 py-2.5 font-sans text-[#a1a1a6]">Units sold on that day</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Current Dataset Profile */}
      {summary && (
        <div className="bg-[#19191b] border border-[#26262a] rounded-lg p-5">
          <div className="pb-3 mb-3 border-b border-[#26262a] flex items-center justify-between">
            <span className="text-xs font-medium text-[#ededed]">Current Active Dataset</span>
            <span className="text-[11px] text-[#34d399] font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]"></span>
              <span>Loaded</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-[#71717a] block text-[10px]">Total records</span>
              <span className="text-lg font-semibold text-[#ededed]">{summary.total_rows.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[#71717a] block text-[10px]">Date range</span>
              <span className="text-lg font-semibold text-[#ededed]">{summary.date_min} to {summary.date_max}</span>
            </div>
            <div>
              <span className="text-[#71717a] block text-[10px]">Store locations</span>
              <span className="text-lg font-semibold text-[#ededed]">{summary.unique_stores} stores</span>
            </div>
            <div>
              <span className="text-[#71717a] block text-[10px]">Product SKUs</span>
              <span className="text-lg font-semibold text-[#ededed]">{summary.unique_items} SKUs</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
