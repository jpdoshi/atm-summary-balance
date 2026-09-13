import React, { useState } from 'react';
import { MAIN_DENOMINATIONS, OPTIONAL_DENOMINATIONS } from '../types/atm';
import type { DenominationCounts, DenominationValue } from '../types/atm';
import { formatINR } from '../utils/numberToWords';
import { Banknote, Trash2, SlidersHorizontal, Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react';

interface NotesContainerProps {
  denominations: DenominationCounts;
  totalNotesAmount: number;
  totalNotesCount: number;
  onChange: (denom: number, count: string) => void;
  onClearNotes: () => void;
}

const DENOM_THEMES: Record<number, { bg: string; text: string; border: string }> = {
  2000: { bg: 'bg-[#F472B6]', text: 'text-black', border: 'border-black' },
  500: { bg: 'bg-[#6EE7B7]', text: 'text-black', border: 'border-black' },
  200: { bg: 'bg-[#FDBA74]', text: 'text-black', border: 'border-black' },
  100: { bg: 'bg-[#C4B5FD]', text: 'text-black', border: 'border-black' },
  50: { bg: 'bg-[#67E8F9]', text: 'text-black', border: 'border-black' },
  20: { bg: 'bg-[#BEF264]', text: 'text-black', border: 'border-black' },
  10: { bg: 'bg-[#FCD34D]', text: 'text-black', border: 'border-black' },
  5: { bg: 'bg-[#86EFAC]', text: 'text-black', border: 'border-black' },
  2: { bg: 'bg-[#E2E8F0]', text: 'text-black', border: 'border-black' },
  1: { bg: 'bg-[#CBD5E1]', text: 'text-black', border: 'border-black' },
};

export const NotesContainer: React.FC<NotesContainerProps> = ({
  denominations,
  totalNotesAmount,
  totalNotesCount,
  onChange,
  onClearNotes,
}) => {
  const [showOptional, setShowOptional] = useState(false);

  // Check if any optional note has counts
  const hasActiveOptionalNotes = OPTIONAL_DENOMINATIONS.some(
    (d) => (parseInt(String(denominations[d] || '0'), 10) || 0) > 0
  );

  const isExpanded = showOptional || hasActiveOptionalNotes;

  const handleInputChange = (denom: number, value: string) => {
    // Only positive integers
    const clean = value.replace(/[^0-9]/g, '');
    onChange(denom, clean);
  };

  const handleStep = (denom: number, delta: number) => {
    const current = parseInt(String(denominations[denom] || '0'), 10) || 0;
    const nextVal = Math.max(0, current + delta);
    onChange(denom, nextVal === 0 ? '' : String(nextVal));
  };

  const renderRow = (denom: DenominationValue) => {
    const rawCount = denominations[denom] || '';
    const countNum = parseInt(String(rawCount), 10) || 0;
    const rowTotal = denom * countNum;
    const theme = DENOM_THEMES[denom] || { bg: 'bg-neutral-100', text: 'text-black', border: 'border-black' };

    return (
      <div
        key={denom}
        className={`grid grid-cols-12 gap-2 items-center p-2 border-2 border-black transition-colors ${
          countNum > 0 ? 'bg-neutral-50 shadow-neo-sm' : 'bg-white hover:bg-neutral-50'
        }`}
      >
        {/* Note Badge */}
        <div className="col-span-4 sm:col-span-3 flex items-center gap-1.5">
          <div
            className={`px-2 py-1 font-mono font-black text-xs sm:text-sm border-2 border-black shadow-neo-sm ${theme.bg} ${theme.text}`}
          >
            ₹ {denom}
          </div>
          <span className="font-mono font-bold text-neutral-400 text-xs hidden sm:inline select-none">
            ×
          </span>
        </div>

        {/* Count Input Box + Steppers */}
        <div className="col-span-4 sm:col-span-5 flex items-center justify-center gap-1">
          <button
            onClick={() => handleStep(denom, -1)}
            disabled={countNum <= 0}
            className="w-6 h-7 sm:w-7 sm:h-8 flex items-center justify-center bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-white border-2 border-black font-bold text-black shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
            title="Subtract 1 note"
            aria-label={`Subtract 1 ₹${denom} note`}
          >
            <Minus className="w-3 h-3" />
          </button>

          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={rawCount}
            onChange={(e) => handleInputChange(denom, e.target.value)}
            aria-label={`Count for ₹${denom} notes`}
            className={`w-14 sm:w-20 text-center font-mono font-extrabold text-sm sm:text-base border-2 border-black py-1 px-1 focus:outline-none focus:ring-2 focus:ring-black ${
              countNum > 0 ? 'bg-yellow-100 text-black' : 'bg-white text-neutral-800'
            }`}
          />

          <button
            onClick={() => handleStep(denom, 1)}
            className="w-6 h-7 sm:w-7 sm:h-8 flex items-center justify-center bg-white hover:bg-neutral-100 border-2 border-black font-bold text-black shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
            title="Add 1 note"
            aria-label={`Add 1 ₹${denom} note`}
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Amount Output */}
        <div className="col-span-4 sm:col-span-4 text-right">
          <span className="font-mono font-black text-sm sm:text-base text-black">
            ₹ {formatINR(rowTotal)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border-4 border-black shadow-neo-lg p-4 sm:p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b-3 border-black pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#A6FAFF] border-2 border-black shadow-neo-sm">
              <Banknote className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black uppercase text-black tracking-tight">
                ATM Notes Tally
              </h2>
              <p className="text-xs font-mono font-semibold text-neutral-600">
                Main: ₹500, ₹200, ₹100
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOptional(!showOptional)}
              className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 border-2 border-black shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 transition-all ${
                isExpanded ? 'bg-[#FFE500] text-black' : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
              }`}
              title="Toggle optional denominations (₹2000, ₹50, ₹20, ₹10, ₹5, ₹2, ₹1)"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isExpanded ? 'Hide Optional' : '+ Optional Notes'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {totalNotesCount > 0 && (
              <button
                onClick={onClearNotes}
                className="p-1 text-xs font-bold bg-[#FEF2F2] hover:bg-[#FEE2E2] text-red-700 border-2 border-black shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
                title="Reset note counts"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 pb-2 px-2 text-xs font-black uppercase font-mono tracking-wider text-neutral-700 border-b-2 border-neutral-200">
          <div className="col-span-4 sm:col-span-3">Note</div>
          <div className="col-span-4 sm:col-span-5 text-center">Count (Pcs)</div>
          <div className="col-span-4 sm:col-span-4 text-right">Amount (₹)</div>
        </div>

        {/* Main Denominations (500, 200, 100) */}
        <div className="space-y-2 mt-2">
          {MAIN_DENOMINATIONS.map((denom) => renderRow(denom))}
        </div>

        {/* Optional Denominations Section */}
        {isExpanded && (
          <div className="mt-4 pt-3 border-t-2 border-dashed border-neutral-300">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-black uppercase font-mono tracking-wider text-neutral-500 flex items-center gap-1.5">
                <span>Optional / Other Denominations</span>
              </span>
              <span className="text-[10px] font-mono bg-neutral-100 text-neutral-600 px-1.5 py-0.5 border border-neutral-300">
                ₹2000, ₹50, ₹20, ₹10, ₹5, ₹2, ₹1
              </span>
            </div>

            <div className="space-y-2">
              {OPTIONAL_DENOMINATIONS.map((denom) => renderRow(denom))}
            </div>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="mt-6 pt-4 border-t-3 border-black">
        <div className="bg-[#A6FAFF] border-3 border-black p-4 shadow-neo">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-black flex items-center gap-1.5">
              Total ATM Cash Balance
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 border-2 border-black shadow-neo-sm text-black">
                {totalNotesCount} {totalNotesCount === 1 ? 'Note' : 'Notes'}
              </span>
              <span className="text-[10px] font-mono font-bold bg-black text-[#A6FAFF] px-1.5 py-0.5 uppercase">
                Disabled Total
              </span>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-black text-right tracking-tight">
            ₹ {formatINR(totalNotesAmount)}
          </div>
        </div>
      </div>
    </div>
  );
};
