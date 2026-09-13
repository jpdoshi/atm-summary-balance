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
      {/* Middle: Side-by-side totals and Amount in Words */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {/* Ledger Book Total */}
        <div className="bg-[#FFFDF5] border-2 border-black p-3.5 shadow-neo-sm">
          <div className="text-xs font-black uppercase tracking-wider text-neutral-600 font-mono">
            1. Ledger Book Total
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-black mt-1">
            ₹ {formatINR(ledgerTotal)}
          </div>
        </div>

        {/* Cash Notes Total */}
        <div className="bg-[#FFFDF5] border-2 border-black p-3.5 shadow-neo-sm">
          <div className="text-xs font-black uppercase tracking-wider text-neutral-600 font-mono flex items-center justify-between gap-1">
            <span>2. ATM Physical Cash Total</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-black mt-1">
            ₹ {formatINR(cashTotal)}
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

      {/* Action Bar with Compact Status */}
      <div className="no-print pt-3 border-t-3 border-black flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-black uppercase text-neutral-500">Status:</span>
          {isMatched ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#86EFAC] text-[#166534] border-2 border-black font-mono font-black text-xs sm:text-sm uppercase shadow-neo-sm">
              <CheckCircle2 className="w-4 h-4" />
              MATCHED
            </span>
          ) : difference > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FED7AA] text-[#9A3412] border-2 border-black font-mono font-black text-xs sm:text-sm uppercase shadow-neo-sm">
              <AlertTriangle className="w-4 h-4" />
              EXCESS: +₹ {formatINR(difference)}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FCA5A5] text-[#991B1B] border-2 border-black font-mono font-black text-xs sm:text-sm uppercase shadow-neo-sm">
              <AlertTriangle className="w-4 h-4" />
              SHORTAGE: -₹ {formatINR(Math.abs(difference))}
            </span>
          )}
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
