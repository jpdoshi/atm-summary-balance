import { useState, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { OpeningBalanceContainer } from './components/OpeningBalanceContainer';
import { NotesContainer } from './components/NotesContainer';
import { ReconciliationBanner } from './components/ReconciliationBanner';
import { HistoryModal } from './components/HistoryModal';
import { ImportExportModal } from './components/ImportExportModal';
import { PrintableSlip } from './components/PrintableSlip';
import type { LedgerFormState, DenominationCounts, ATMRecord } from './types/atm';
import { numberToWordsINR } from './utils/numberToWords';
import { getAllRecords, getRecordByDate, saveRecord, deleteRecord } from './utils/storage';
import { generateATMSummaryPDF, shareSummaryText } from './utils/pdfGenerator';
import { Check, Info } from 'lucide-react';

export function App() {
  const getTodayStr = () => new Date().toISOString().split('T')[0];

  const [currentDate, setCurrentDate] = useState<string>(getTodayStr);

  const initialRecord = useMemo(() => getRecordByDate(getTodayStr()), []);

  const [ledger, setLedger] = useState<LedgerFormState>(() => {
    if (initialRecord) {
      return {
        openingBalance: initialRecord.ledger.openingBalance ? String(initialRecord.ledger.openingBalance) : '',
        totalReceipt: initialRecord.ledger.totalReceipt ? String(initialRecord.ledger.totalReceipt) : '',
        payment: initialRecord.ledger.payment ? String(initialRecord.ledger.payment) : '',
        todaysReceipt: initialRecord.ledger.todaysReceipt ? String(initialRecord.ledger.todaysReceipt) : '',
        todaysPayment: initialRecord.ledger.todaysPayment ? String(initialRecord.ledger.todaysPayment) : '',
      };
    }
    return {
      openingBalance: '',
      totalReceipt: '',
      payment: '',
      todaysReceipt: '',
      todaysPayment: '',
    };
  });

  const [denominations, setDenominations] = useState<DenominationCounts>(() => initialRecord?.denominations || {});

  const [recordId, setRecordId] = useState<string>(() => initialRecord?.id || 'atm_' + Date.now());
  const [savedRecords, setSavedRecords] = useState<ATMRecord[]>(() => getAllRecords());
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  // Load record for a given date if exists
  const loadRecordForDate = useCallback((date: string) => {
    const existing = getRecordByDate(date);
    if (existing) {
      setLedger({
        openingBalance: existing.ledger.openingBalance ? String(existing.ledger.openingBalance) : '',
        totalReceipt: existing.ledger.totalReceipt ? String(existing.ledger.totalReceipt) : '',
        payment: existing.ledger.payment ? String(existing.ledger.payment) : '',
        todaysReceipt: existing.ledger.todaysReceipt ? String(existing.ledger.todaysReceipt) : '',
        todaysPayment: existing.ledger.todaysPayment ? String(existing.ledger.todaysPayment) : '',
      });
      setDenominations(existing.denominations || {});
      setRecordId(existing.id);
    } else {
      // Clean slate for new date
      setLedger({
        openingBalance: '',
        totalReceipt: '',
        payment: '',
        todaysReceipt: '',
        todaysPayment: '',
      });
      setDenominations({});
      setRecordId('atm_' + Date.now());
    }
  }, []);

  // When date changes
  const handleDateChange = (newDate: string) => {
    setCurrentDate(newDate);
    loadRecordForDate(newDate);
  };

  // Calculations for Ledger
  const ledgerCalculations = useMemo(() => {
    const opening = parseFloat(ledger.openingBalance) || 0;
    const totRec = parseFloat(ledger.totalReceipt) || 0;
    const sub1 = opening + totRec;

    const pmt = parseFloat(ledger.payment) || 0;
    const sub2 = sub1 - pmt;

    const todayRec = parseFloat(ledger.todaysReceipt) || 0;
    const sub3 = sub2 + todayRec;

    const todayPmt = parseFloat(ledger.todaysPayment) || 0;
    const finalTotal = sub3 - todayPmt;

    return {
      subtotal1: sub1,
      subtotal2: sub2,
      subtotal3: sub3,
      finalTotal,
    };
  }, [ledger]);

  // Calculations for Notes
  const { totalNotesAmount, totalNotesCount } = useMemo(() => {
    let amount = 0;
    let count = 0;
    Object.entries(denominations).forEach(([denomStr, countVal]) => {
      const denom = parseInt(denomStr, 10);
      const c = parseInt(String(countVal), 10) || 0;
      if (denom > 0 && c > 0) {
        amount += denom * c;
        count += c;
      }
    });
    return { totalNotesAmount: amount, totalNotesCount: count };
  }, [denominations]);

  // Reconciliation
  const ledgerTotal = ledgerCalculations.finalTotal;
  const isMatched = ledgerTotal === totalNotesAmount;
  const difference = totalNotesAmount - ledgerTotal; // >0 is excess, <0 is shortage

  // Amount in words: format either the matched amount, or physical cash, or ledger
  const amountInWords = useMemo(() => {
    const targetAmt = isMatched ? ledgerTotal : totalNotesAmount || ledgerTotal;
    return numberToWordsINR(targetAmt);
  }, [isMatched, ledgerTotal, totalNotesAmount]);

  const hasSavedDataForCurrentDate = useMemo(() => {
    return savedRecords.some((r) => r.date === currentDate);
  }, [savedRecords, currentDate]);

  // Full Record snapshot
  const currentRecordSnapshot: ATMRecord = useMemo(() => {
    const denomMap: Record<number, number> = {};
    Object.entries(denominations).forEach(([k, v]) => {
      denomMap[parseInt(k, 10)] = parseInt(String(v), 10) || 0;
    });

    return {
      id: recordId,
      date: currentDate,
      ledger: {
        openingBalance: parseFloat(ledger.openingBalance) || 0,
        totalReceipt: parseFloat(ledger.totalReceipt) || 0,
        payment: parseFloat(ledger.payment) || 0,
        todaysReceipt: parseFloat(ledger.todaysReceipt) || 0,
        todaysPayment: parseFloat(ledger.todaysPayment) || 0,
      },
      denominations: denomMap,
      calculations: {
        subtotal1: ledgerCalculations.subtotal1,
        subtotal2: ledgerCalculations.subtotal2,
        subtotal3: ledgerCalculations.subtotal3,
        ledgerTotal,
        notesTotal: totalNotesAmount,
        totalNotesCount,
        difference,
        isMatched,
      },
      amountInWords,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [
    recordId,
    currentDate,
    ledger,
    denominations,
    ledgerCalculations,
    ledgerTotal,
    totalNotesAmount,
    totalNotesCount,
    difference,
    isMatched,
    amountInWords,
  ]);

  // Handlers
  const handleLedgerChange = (field: keyof LedgerFormState, value: string) => {
    setLedger((prev) => ({ ...prev, [field]: value }));
  };

  const handleDenominationChange = (denom: number, count: string) => {
    setDenominations((prev) => ({ ...prev, [denom]: count }));
  };

  const handleClearNotes = () => {
    setDenominations({});
  };

  const handleResetAll = () => {
    if (window.confirm('Reset all values on this sheet?')) {
      setLedger({
        openingBalance: '',
        totalReceipt: '',
        payment: '',
        todaysReceipt: '',
        todaysPayment: '',
      });
      setDenominations({});
      showToast('Form cleared', 'info');
    }
  };

  // Load the sample values from user handwritten note:
  // Opening: 1000, Total Receipt: 1000 -> 2000
  // Payment: 1000 -> 1000
  // Todays Receipt: 1000 -> 2000
  // Todays Payment: 1000 -> 1000
  // Notes: 500 x 2 = 1000
  const handleFillExample = () => {
    setLedger({
      openingBalance: '1000',
      totalReceipt: '1000',
      payment: '1000',
      todaysReceipt: '1000',
      todaysPayment: '1000',
    });
    setDenominations({
      500: '2',
    });
    showToast('Loaded handwritten example: ₹1,000 Balanced!', 'success');
  };

  const handleSave = () => {
    const updatedList = saveRecord(currentRecordSnapshot);
    setSavedRecords(updatedList);
    showToast(`Saved balance sheet for ${currentDate}!`, 'success');
  };

  const handleDownloadPDF = () => {
    generateATMSummaryPDF(currentRecordSnapshot, true);
    showToast('PDF downloaded successfully!', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    shareSummaryText(currentRecordSnapshot);
  };

  const handleLoadFromHistory = (rec: ATMRecord) => {
    setCurrentDate(rec.date);
    setRecordId(rec.id);
    setLedger({
      openingBalance: rec.ledger.openingBalance ? String(rec.ledger.openingBalance) : '',
      totalReceipt: rec.ledger.totalReceipt ? String(rec.ledger.totalReceipt) : '',
      payment: rec.ledger.payment ? String(rec.ledger.payment) : '',
      todaysReceipt: rec.ledger.todaysReceipt ? String(rec.ledger.todaysReceipt) : '',
      todaysPayment: rec.ledger.todaysPayment ? String(rec.ledger.todaysPayment) : '',
    });
    setDenominations(rec.denominations || {});
    showToast(`Loaded record for ${rec.date}`, 'info');
  };

  const handleDeleteFromHistory = (id: string) => {
    const updated = deleteRecord(id);
    setSavedRecords(updated);
    showToast('Record deleted from history', 'info');
  };

  const handleDataImported = () => {
    const updated = getAllRecords();
    setSavedRecords(updated);
    loadRecordForDate(currentDate);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF5] text-black">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`px-4 py-3 border-3 border-black shadow-neo font-mono font-black text-xs sm:text-sm flex items-center gap-2.5 ${toast.type === 'success'
              ? 'bg-[#86EFAC] text-black'
              : toast.type === 'error'
                ? 'bg-[#FCA5A5] text-black'
                : 'bg-[#FFE500] text-black'
              }`}
          >
            {toast.type === 'success' ? (
              <Check className="w-4 h-4 text-black flex-shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-black flex-shrink-0" />
            )}
            <span>{toast.text}</span>
          </div>
        </div>
      )}

      {/* Navigation & Header */}
      <Navbar
        currentDate={currentDate}
        onDateChange={handleDateChange}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenImportExport={() => setIsImportExportOpen(true)}
        onResetAll={handleResetAll}
        historyCount={savedRecords.length}
        hasSavedDataForCurrentDate={hasSavedDataForCurrentDate}
      />

      {/* Main Container */}
      <main className="no-print flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* 2-Column Responsive Layout: Opening Balance Ledger vs Notes Counter */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          {/* Container 1: Opening Balance Ledger */}
          <OpeningBalanceContainer
            ledger={ledger}
            calculations={ledgerCalculations}
            onChange={handleLedgerChange}
            onFillExample={handleFillExample}
          />

          {/* Container 2: Currency Notes Denomination Counter */}
          <NotesContainer
            denominations={denominations}
            totalNotesAmount={totalNotesAmount}
            totalNotesCount={totalNotesCount}
            onChange={handleDenominationChange}
            onClearNotes={handleClearNotes}
          />

        </div>
        {/* Reconciliation Status & Actions Banner */}
        <ReconciliationBanner
          ledgerTotal={ledgerTotal}
          cashTotal={totalNotesAmount}
          isMatched={isMatched}
          difference={difference}
          amountInWords={amountInWords}
          onSave={handleSave}
          onDownloadPDF={handleDownloadPDF}
          onPrint={handlePrint}
          onShare={handleShare}
          isSaved={hasSavedDataForCurrentDate}
        />

        {/* Quick Help & Shortcuts Footer */}
        <div className="bg-neutral-100 border-2 border-black p-4 shadow-neo-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono font-bold text-neutral-600">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-black text-white text-[10px] uppercase">TIP</span>
            <span>All subtotals and totals calculate dynamically in real time.</span>
          </div>
          <div>
            Data is persisted in your browser's LocalStorage. Backup anytime via the Backup button.
          </div>
        </div>
      </main>

      {/* Hidden during screen, displayed when window.print() is invoked */}
      <PrintableSlip record={currentRecordSnapshot} />

      {/* History Slide-over/Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        records={savedRecords}
        onLoadRecord={handleLoadFromHistory}
        onDeleteRecord={handleDeleteFromHistory}
      />

      {/* Import / Export Modal */}
      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        onDataImported={handleDataImported}
        recordCount={savedRecords.length}
      />
    </div>
  );
}

export default App;