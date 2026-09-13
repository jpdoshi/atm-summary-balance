import React, { useState } from 'react';
import type { ATMRecord } from '../types/atm';
import { formatINR } from '../utils/numberToWords';
import { generateATMSummaryPDF } from '../utils/pdfGenerator';
import { X, Search, FileDown, Trash2, ArrowUpRight, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: ATMRecord[];
  onLoadRecord: (record: ATMRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  records,
  onLoadRecord,
  onDeleteRecord,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'MATCHED' | 'MISMATCH'>('ALL');

  if (!isOpen) return null;

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.date.includes(searchTerm) ||
      (rec.amountInWords && rec.amountInWords.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterStatus === 'MATCHED') return rec.calculations.isMatched;
    if (filterStatus === 'MISMATCH') return !rec.calculations.isMatched;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white border-4 border-black shadow-neo-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#FFE500] border-b-3 border-black p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-black text-[#FFE500]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black uppercase text-black tracking-tight">
                Balance Sheets History
              </h2>
              <p className="text-xs font-mono font-bold text-black/75">
                {records.length} saved {records.length === 1 ? 'record' : 'records'} in LocalStorage
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

        {/* Filter / Search Bar */}
        <div className="p-4 border-b-2 border-black bg-neutral-50 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by date (YYYY-MM-DD) or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-2 border-black pl-9 pr-3 py-1.5 font-mono text-xs sm:text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex items-center gap-1 w-full sm:w-auto">
            {(['ALL', 'MATCHED', 'MISMATCH'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-2.5 py-1.5 text-xs font-black uppercase font-mono border-2 border-black shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 transition-all ${
                  filterStatus === status
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-neutral-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Record List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-neutral-300">
              <AlertCircle className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
              <p className="font-bold text-neutral-700 text-base">No balance sheets found</p>
              <p className="text-xs text-neutral-500 mt-1 font-mono">
                {records.length === 0
                  ? 'Fill out today’s balance sheet and click "Save Balance Sheet" to record history.'
                  : 'No records matched your search filter.'}
              </p>
            </div>
          ) : (
            filteredRecords.map((rec) => {
              const isMatched = rec.calculations.isMatched;
              return (
                <div
                  key={rec.id}
                  className="bg-white border-2 border-black p-3.5 shadow-neo-sm hover:shadow-neo transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-base text-black bg-neutral-100 px-2 py-0.5 border border-black">
                        {rec.date}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-black uppercase px-2 py-0.5 border border-black ${
                          isMatched
                            ? 'bg-[#86EFAC] text-[#166534]'
                            : 'bg-[#FCA5A5] text-[#991B1B]'
                        }`}
                      >
                        {isMatched ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> MATCHED
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3" /> MISMATCH
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-neutral-700 pt-1">
                      <span>
                        Ledger: <strong className="text-black">₹ {formatINR(rec.calculations.ledgerTotal)}</strong>
                      </span>
                      <span>
                        Cash: <strong className="text-black">₹ {formatINR(rec.calculations.notesTotal)}</strong>
                      </span>
                      {!isMatched && (
                        <span className="text-red-700 font-bold">
                          Diff: ₹ {formatINR(Math.abs(rec.calculations.difference))} ({rec.calculations.difference > 0 ? 'Excess' : 'Shortage'})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                    <button
                      onClick={() => {
                        onLoadRecord(rec);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-[#FFE500] hover:bg-[#fed900] text-black font-black text-xs uppercase border-2 border-black shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
                      title="Load this record into the editor"
                    >
                      <span>Load</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => generateATMSummaryPDF(rec, true)}
                      className="p-1.5 bg-white hover:bg-neutral-100 text-black border-2 border-black shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
                      title="Download PDF"
                    >
                      <FileDown className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Delete balance sheet for ${rec.date}?`)) {
                          onDeleteRecord(rec.id);
                        }
                      }}
                      className="p-1.5 bg-[#FEF2F2] hover:bg-[#FEE2E2] text-red-600 border-2 border-black shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
                      title="Delete this record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-neutral-100 border-t-2 border-black p-3 flex justify-between items-center text-xs font-mono font-bold text-neutral-600">
          <span>Records: {filteredRecords.length} of {records.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-black text-white hover:bg-neutral-800 uppercase font-black tracking-wider transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
