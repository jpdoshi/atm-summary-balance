import React, { useState, useRef } from 'react';
import { exportToJSON, exportToCSV, importFromJSON, downloadFile, clearAllRecords } from '../utils/storage';
import { X, Download, Upload, FileSpreadsheet, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataImported: () => void;
  recordCount: number;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  onDataImported,
  recordCount,
}) => {
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const json = exportToJSON();
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(json, `ATM_Summary_Backup_${dateStr}.json`, 'application/json');
    setFeedback({ type: 'success', message: 'Backup JSON downloaded successfully!' });
  };

  const handleExportCSV = () => {
    const csv = exportToCSV();
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(csv, `ATM_Summary_Ledger_${dateStr}.csv`, 'text/csv');
    setFeedback({ type: 'success', message: 'Spreadsheet CSV downloaded successfully!' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importFromJSON(content);
      if (res.success) {
        setFeedback({ type: 'success', message: `Imported ${res.count} record(s) successfully!` });
        onDataImported();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to import JSON file' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to permanently clear ALL saved ATM balance records? This action cannot be undone.')) {
      clearAllRecords();
      onDataImported();
      setFeedback({ type: 'success', message: 'All local records wiped successfully.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white border-4 border-black shadow-neo-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#70A9FF] border-b-3 border-black p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-black text-[#70A9FF]">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black uppercase text-black tracking-tight">
                Import & Export Data
              </h2>
              <p className="text-xs font-mono font-bold text-black/75">
                Local storage backup & spreadsheet transfer
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-white hover:bg-neutral-100 text-black border-2 border-black shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {feedback && (
            <div
              className={`p-3 border-2 border-black font-bold text-xs flex items-center gap-2 ${
                feedback.type === 'success' ? 'bg-[#86EFAC] text-[#166534]' : 'bg-[#FCA5A5] text-[#991B1B]'
              }`}
            >
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Export Options */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase font-mono text-neutral-600">
              Export / Backup
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleExportJSON}
                disabled={recordCount === 0}
                className="flex items-center justify-center gap-2 p-3 bg-white hover:bg-yellow-50 disabled:opacity-40 disabled:hover:bg-white text-black font-bold text-xs uppercase border-2 border-black shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 transition-all text-left"
              >
                <Download className="w-4 h-4 text-black flex-shrink-0" />
                <div>
                  <div className="font-black">JSON Backup</div>
                  <div className="text-[10px] text-neutral-500 font-mono">Full data backup</div>
                </div>
              </button>

              <button
                onClick={handleExportCSV}
                disabled={recordCount === 0}
                className="flex items-center justify-center gap-2 p-3 bg-white hover:bg-green-50 disabled:opacity-40 disabled:hover:bg-white text-black font-bold text-xs uppercase border-2 border-black shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 transition-all text-left"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#166534] flex-shrink-0" />
                <div>
                  <div className="font-black">CSV Spreadsheet</div>
                  <div className="text-[10px] text-neutral-500 font-mono">Excel compatible</div>
                </div>
              </button>
            </div>
          </div>

          {/* Import Option */}
          <div className="space-y-2 pt-2 border-t-2 border-neutral-200">
            <h3 className="text-xs font-black uppercase font-mono text-neutral-600">
              Import / Restore
            </h3>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 p-3.5 bg-[#FFE500] hover:bg-[#fed900] text-black font-black text-xs uppercase border-2 border-black shadow-neo active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Select JSON Backup File to Import</span>
            </button>
          </div>

          {/* Danger Zone: Clear */}
          <div className="pt-2 border-t-2 border-neutral-200 flex justify-between items-center">
            <div className="text-xs font-mono text-neutral-600">
              Current records stored: <strong>{recordCount}</strong>
            </div>

            <button
              onClick={handleClearAll}
              disabled={recordCount === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase bg-[#FEF2F2] hover:bg-[#FEE2E2] disabled:opacity-30 disabled:hover:bg-[#FEF2F2] text-red-600 border-2 border-black shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-neutral-100 border-t-2 border-black p-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-black text-white hover:bg-neutral-800 uppercase font-black text-xs tracking-wider transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
