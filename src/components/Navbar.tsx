import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, History, ArrowDownUp, RefreshCw } from 'lucide-react';

interface NavbarProps {
  currentDate: string;
  onDateChange: (date: string) => void;
  onOpenHistory: () => void;
  onOpenImportExport: () => void;
  onResetAll: () => void;
  historyCount: number;
  hasSavedDataForCurrentDate: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentDate,
  onDateChange,
  onOpenHistory,
  onOpenImportExport,
  onResetAll,
  historyCount,
  hasSavedDataForCurrentDate,
}) => {
  const handlePrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleSetToday = () => {
    const today = new Date().toISOString().split('T')[0];
    onDateChange(today);
  };

  const isToday = currentDate === new Date().toISOString().split('T')[0];

  return (
    <header className="no-print bg-[#FFE500] border-b-4 border-black px-4 py-3 sm:px-6 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-black text-[#FFE500] flex items-center justify-center font-extrabold text-xl border-2 border-black shadow-neo-sm">
              ₹
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-none text-black uppercase">
                ATM Balance Summary
              </h1>
              <span className="text-xs font-bold text-black/75 tracking-wider uppercase font-mono">
                Ledger & Cash Reconciliation
              </span>
            </div>
          </div>

          {hasSavedDataForCurrentDate && (
            <span className="md:hidden inline-flex items-center px-2 py-0.5 text-xs font-black bg-[#A6FAFF] border-2 border-black shadow-neo-sm">
              SAVED
            </span>
          )}
        </div>

        {/* Date Selector & Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 w-full md:w-auto">
          {/* Quick Date Stepper */}
          <div className="flex items-center bg-white border-2 border-black shadow-neo-sm">
            <button
              onClick={handlePrevDay}
              title="Previous Day"
              aria-label="Previous Day"
              className="p-1.5 hover:bg-neutral-100 active:bg-neutral-200 border-r-2 border-black transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-black" />
            </button>

            <div className="flex items-center px-2 py-1 gap-1.5">
              <Calendar className="w-4 h-4 text-black" />
              <input
                type="date"
                value={currentDate}
                onChange={(e) => e.target.value && onDateChange(e.target.value)}
                className="font-mono font-bold text-sm bg-transparent outline-none cursor-pointer text-black"
                title="Select Date"
                aria-label="Select Date"
              />
            </div>

            <button
              onClick={handleNextDay}
              title="Next Day"
              aria-label="Next Day"
              className="p-1.5 hover:bg-neutral-100 active:bg-neutral-200 border-l-2 border-black transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-black" />
            </button>
          </div>

          {!isToday && (
            <button
              onClick={handleSetToday}
              className="px-2.5 py-1 text-xs font-bold uppercase bg-white hover:bg-neutral-100 text-black border-2 border-black shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 transition-transform"
            >
              Today
            </button>
          )}

          {hasSavedDataForCurrentDate && (
            <span className="hidden md:inline-flex items-center px-2.5 py-1 text-xs font-black bg-[#A6FAFF] border-2 border-black shadow-neo-sm uppercase">
              ● Saved Record
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold uppercase bg-[#FF6584] hover:bg-[#ff4f73] text-white border-2 border-black shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
            title="View Saved Balance Sheets History"
          >
            <History className="w-4 h-4" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-black text-white font-mono text-xs rounded-full border border-white">
                {historyCount}
              </span>
            )}
          </button>

          {/* Import / Export */}
          <button
            onClick={onOpenImportExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold uppercase bg-[#70A9FF] hover:bg-[#5293ff] text-black border-2 border-black shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
            title="Import / Export Data"
          >
            <ArrowDownUp className="w-4 h-4" />
            <span className="hidden sm:inline">Backup</span>
          </button>

          {/* Reset Sheet */}
          <button
            onClick={onResetAll}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs sm:text-sm font-bold uppercase bg-white hover:bg-neutral-100 text-black border-2 border-black shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
            title="Clear Current Form"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>
    </header>
  );
};
