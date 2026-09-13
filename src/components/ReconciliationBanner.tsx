import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, AlertTriangle, Save, FileDown, Printer, Share2 } from 'lucide-react';
import { formatINR } from '../utils/numberToWords';

interface ReconciliationBannerProps {
  ledgerTotal: number;
  cashTotal: number;
  isMatched: boolean;
  difference: number;
  amountInWords: string;
  onSave: () => void;
  onDownloadPDF: () => void;
  onPrint: () => void;
  onShare: () => void;
  isSaved: boolean;
}

export const ReconciliationBanner: React.FC<ReconciliationBannerProps> = ({
  ledgerTotal,
  cashTotal,
  isMatched,
  difference,
  amountInWords,
  onSave,
  onDownloadPDF,
  onPrint,
  onShare,
  isSaved,
}) => {
  // Fire celebratory confetti when balanced and greater than 0
  useEffect(() => {
    if (isMatched && ledgerTotal > 0) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFE500', '#00F0FF', '#FF6584', '#00E676', '#121212'],
      });
    }
  }, [isMatched, ledgerTotal]);

  const hasActivity = ledgerTotal > 0 || cashTotal > 0;

  return (
    <div className="bg-white border-4 border-black shadow-neo-lg p-5 sm:p-6 mb-8 transition-all">
      {/* Top Status Header */}
      <div
        className={`p-4 sm:p-5 border-3 border-black shadow-neo flex flex-col md:flex-row items-center justify-between gap-4 transition-colors ${isMatched
            ? 'bg-[#86EFAC] text-black'
            : 'bg-[#FCA5A5] text-black'
          }`}
      >
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          <div
            className={`w-12 h-12 flex-shrink-0 flex items-center justify-center border-2 border-black shadow-neo-sm ${isMatched ? 'bg-white text-[#166534]' : 'bg-white text-[#991B1B]'
              }`}
          >
            {isMatched ? (
              <CheckCircle2 className="w-7 h-7" />
            ) : (
              <AlertTriangle className="w-7 h-7" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black uppercase px-2 py-0.5 bg-black text-white">
                GL BALANCE
              </span>
              {isSaved && (
                <span className="text-xs font-mono font-black uppercase px-2 py-0.5 bg-[#FFE500] text-black border border-black">
                  SAVED TO DISK
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight mt-0.5">
              {isMatched ? 'MATCHED — PERFECT TALLY!' : 'MISMATCH — DISCREPANCY DETECTED!'}
            </h3>

            <p className="text-xs sm:text-sm font-bold opacity-90 mt-0.5">
              {isMatched
                ? 'The transactional ledger matches physical cash in the ATM cassettes exactly.'
                : difference > 0
                  ? `Physical Cash exceeds Ledger Book by ₹ ${formatINR(difference)} (Cash Excess / Surplus)`
                  : `Physical Cash is short of Ledger Book by ₹ ${formatINR(Math.abs(difference))} (Cash Shortage / Deficit)`}
            </p>
          </div>
        </div>

        {/* Quick Tally Diff Badge */}
        <div className="bg-white border-2 border-black p-2.5 sm:p-3 text-center min-w-[170px] shadow-neo-sm w-full md:w-auto">
          <div className="text-[11px] font-black uppercase font-mono text-neutral-500">
            Net Discrepancy
          </div>
          <div
            className={`text-lg sm:text-xl font-mono font-black ${isMatched ? 'text-[#166534]' : 'text-[#991B1B]'
              }`}
          >
            {isMatched ? '₹ 0.00' : `₹ ${formatINR(Math.abs(difference))}`}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 font-mono">
            {isMatched ? 'Zero Difference' : difference > 0 ? 'Cash Excess' : 'Cash Shortage'}
          </div>
        </div>
      </div>

      {/* Middle: Side-by-side totals and Amount in Words */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5">
        {/* Ledger Book Total */}
        <div className="bg-[#FFFDF5] border-2 border-black p-3.5 shadow-neo-sm">
          <div className="text-xs font-black uppercase tracking-wider text-neutral-600 font-mono">
            1. Ledger Book Total
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-black mt-1">
            ₹ {formatINR(ledgerTotal)}
          </div>
          <div className="text-[11px] font-semibold text-neutral-500 mt-0.5">
            Opening + Receipts - Payments
          </div>
        </div>

        {/* Cash Notes Total */}
        <div className="bg-[#FFFDF5] border-2 border-black p-3.5 shadow-neo-sm">
          <div className="text-xs font-black uppercase tracking-wider text-neutral-600 font-mono">
            2. ATM Physical Cash Total
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-black mt-1">
            ₹ {formatINR(cashTotal)}
          </div>
          <div className="text-[11px] font-semibold text-neutral-500 mt-0.5">
            Sum of currency cassette notes
          </div>
        </div>

        {/* Amount in Words Card */}
        <div className="bg-[#FFE500]/20 border-2 border-black p-3.5 shadow-neo-sm flex flex-col justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-black font-mono flex items-center justify-between">
              <span>Amount in Words</span>
              <span className="text-[10px] bg-black text-[#FFE500] px-1 py-0.2">WORDS IN FIGURE</span>
            </div>
            <div className="text-sm sm:text-base font-extrabold italic text-black mt-1.5 leading-snug">
              {hasActivity ? amountInWords : 'Zero Rupees Only'}
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar (Save, Download PDF, Print, Share) */}
      <div className="no-print pt-3 border-t-3 border-black flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-mono font-bold text-neutral-500">
          Reconciliation Actions:
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Save Button */}
          <button
            onClick={onSave}
            className={`flex items-center gap-2 px-4 py-2.5 font-black uppercase text-xs sm:text-sm border-2 border-black shadow-neo active:translate-x-0.5 active:translate-y-0.5 transition-all ${isSaved
                ? 'bg-[#22C55E] text-white hover:bg-[#16a34a]'
                : 'bg-[#FFE500] text-black hover:bg-[#fed900]'
              }`}
          >
            <Save className="w-4 h-4" />
            <span>{isSaved ? 'Update Saved Sheet' : 'Save Balance Sheet'}</span>
          </button>

          {/* Download PDF */}
          <button
            onClick={onDownloadPDF}
            className="flex items-center gap-2 px-4 py-2.5 font-black uppercase text-xs sm:text-sm bg-white hover:bg-neutral-100 text-black border-2 border-black shadow-neo active:translate-x-0.5 active:translate-y-0.5 transition-all"
            title="Download formatted PDF slip"
          >
            <FileDown className="w-4 h-4" />
            <span>Download PDF</span>
          </button>

          {/* Print Slip */}
          <button
            onClick={onPrint}
            className="flex items-center gap-2 px-4 py-2.5 font-black uppercase text-xs sm:text-sm bg-[#A6FAFF] hover:bg-[#7ff4fc] text-black border-2 border-black shadow-neo active:translate-x-0.5 active:translate-y-0.5 transition-all"
            title="Print or Save via Print Dialog"
          >
            <Printer className="w-4 h-4" />
            <span>Print Slip</span>
          </button>

          {/* Share Summary */}
          <button
            onClick={onShare}
            className="flex items-center gap-2 px-3.5 py-2.5 font-black uppercase text-xs sm:text-sm bg-neutral-100 hover:bg-neutral-200 text-black border-2 border-black shadow-neo active:translate-x-0.5 active:translate-y-0.5 transition-all"
            title="Share summary via WhatsApp, SMS, or Clipboard"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};
