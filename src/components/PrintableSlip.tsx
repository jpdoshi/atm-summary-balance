import React from 'react';
import type { ATMRecord } from '../types/atm';
import { formatINR } from '../utils/numberToWords';

interface PrintableSlipProps {
  record: ATMRecord;
}

export const PrintableSlip: React.FC<PrintableSlipProps> = ({ record }) => {
  const isMatched = record.calculations.isMatched;

  return (
    <div className="print-only p-8 max-w-4xl mx-auto bg-white text-black font-sans">
      {/* Header */}
      <div className="border-4 border-black p-4 mb-6 bg-yellow-100">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">
              ATM Balance Summary & Cash Reconciliation
            </h1>
            <p className="text-xs font-mono font-bold text-neutral-700 mt-1">
              DAILY CASH RECONCILIATION AUDIT SLIP
            </p>
          </div>
          <div className="text-right font-mono text-xs">
            <div className="font-bold">DATE: {record.date}</div>
            <div className="text-neutral-600">ID: {record.id.slice(0, 8)}</div>
          </div>
        </div>
      </div>

      {/* Grid: Ledger + Notes */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Ledger */}
        <div className="border-2 border-black p-4">
          <h2 className="text-sm font-black uppercase tracking-wider pb-2 mb-3 border-b-2 border-black">
            1. Opening Balance & Ledger
          </h2>
          <table className="w-full text-xs font-mono">
            <tbody>
              <tr className="border-b border-neutral-200">
                <td className="py-1">Opening Balance:</td>
                <td className="py-1 text-right font-bold">₹ {formatINR(record.ledger.openingBalance)}</td>
              </tr>
              <tr className="border-b border-neutral-200">
                <td className="py-1">(+) Total Receipt:</td>
                <td className="py-1 text-right font-bold text-green-800">+ ₹ {formatINR(record.ledger.totalReceipt)}</td>
              </tr>
              <tr className="border-b-2 border-black bg-neutral-100 font-bold">
                <td className="py-1">(=) Subtotal 1:</td>
                <td className="py-1 text-right">₹ {formatINR(record.calculations.subtotal1)}</td>
              </tr>
              <tr className="border-b border-neutral-200">
                <td className="py-1">(-) Payment:</td>
                <td className="py-1 text-right font-bold text-red-800">- ₹ {formatINR(record.ledger.payment)}</td>
              </tr>
              <tr className="border-b-2 border-black bg-neutral-100 font-bold">
                <td className="py-1">(=) Subtotal 2:</td>
                <td className="py-1 text-right">₹ {formatINR(record.calculations.subtotal2)}</td>
              </tr>
              <tr className="border-b border-neutral-200">
                <td className="py-1">(+) Today's Receipt:</td>
                <td className="py-1 text-right font-bold text-green-800">+ ₹ {formatINR(record.ledger.todaysReceipt)}</td>
              </tr>
              <tr className="border-b-2 border-black bg-neutral-100 font-bold">
                <td className="py-1">(=) Subtotal 3:</td>
                <td className="py-1 text-right">₹ {formatINR(record.calculations.subtotal3)}</td>
              </tr>
              <tr className="border-b border-neutral-200">
                <td className="py-1">(-) Today's Payment:</td>
                <td className="py-1 text-right font-bold text-red-800">- ₹ {formatINR(record.ledger.todaysPayment)}</td>
              </tr>
              <tr className="bg-yellow-200 font-black text-sm border-t-2 border-b-2 border-black">
                <td className="py-1.5 font-sans">FINAL LEDGER BALANCE:</td>
                <td className="py-1.5 text-right font-mono">₹ {formatINR(record.calculations.ledgerTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Notes */}
        <div className="border-2 border-black p-4">
          <h2 className="text-sm font-black uppercase tracking-wider pb-2 mb-3 border-b-2 border-black">
            2. Currency Notes Tally
          </h2>
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-black text-neutral-600 font-bold">
                <th className="text-left py-1">Denom</th>
                <th className="text-center py-1">Count</th>
                <th className="text-right py-1">Amount</th>
              </tr>
            </thead>
            <tbody>
              {[2000, 500, 200, 100, 50, 20, 10, 5].map((denom) => {
                const count = record.denominations[denom] || 0;
                const total = denom * count;
                return (
                  <tr key={denom} className="border-b border-neutral-200">
                    <td className="py-1 font-bold">₹ {denom}</td>
                    <td className="py-1 text-center font-bold">{count}</td>
                    <td className="py-1 text-right">₹ {formatINR(total)}</td>
                  </tr>
                );
              })}
              <tr className="bg-cyan-100 font-black text-sm border-t-2 border-b-2 border-black">
                <td className="py-1.5 font-sans">TOTAL CASH ({record.calculations.totalNotesCount} pcs):</td>
                <td></td>
                <td className="py-1.5 text-right font-mono">₹ {formatINR(record.calculations.notesTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Reconciliation Box */}
      <div
        className={`border-3 border-black p-4 mb-8 ${
          isMatched ? 'bg-green-100' : 'bg-red-100'
        }`}
      >
        <div className="flex justify-between items-center mb-2">
          <div className="font-black text-base uppercase">
            RECONCILIATION STATUS: {isMatched ? 'MATCHED (TALLIED)' : 'MISMATCH (DISCREPANCY)'}
          </div>
          <div className="font-mono font-bold text-sm">
            DIFFERENCE: ₹ {formatINR(record.calculations.difference)}
          </div>
        </div>
        <div className="text-xs font-serif italic border-t border-black/30 pt-2">
          <strong>Words in figure:</strong> {record.amountInWords}
        </div>
      </div>

      {/* Signature Lines */}
      <div className="grid grid-cols-3 gap-6 pt-12 text-center text-xs font-mono">
        <div>
          <div className="border-t-2 border-black pt-1 font-bold">Cashier / Custodian Signature</div>
        </div>
        <div>
          <div className="border-t-2 border-black pt-1 font-bold">Verified By (Supervisor)</div>
        </div>
        <div>
          <div className="border-t-2 border-black pt-1 font-bold">Branch Manager / Stamp</div>
        </div>
      </div>
    </div>
  );
};
