import React from 'react';
import type { LedgerFormState, LedgerCalculated } from '../types/atm';
import { formatINR } from '../utils/numberToWords';
import { Plus, Minus, Equal, Landmark } from 'lucide-react';

interface OpeningBalanceContainerProps {
  ledger: LedgerFormState;
  calculations: LedgerCalculated;
  onChange: (field: keyof LedgerFormState, value: string) => void;
  onFillExample?: () => void;
}

export const OpeningBalanceContainer: React.FC<OpeningBalanceContainerProps> = ({
  ledger,
  calculations,
  onChange,
}) => {
  const handleInputChange = (field: keyof LedgerFormState, e: React.ChangeEvent<HTMLInputElement>) => {
    // allow only numbers or empty string
    const val = e.target.value.replace(/[^0-9.]/g, '');
    onChange(field, val);
  };

  return (
    <div className="bg-white border-4 border-black shadow-neo-lg p-4 sm:p-6 flex flex-col justify-between">
      {/* Container Header */}
      <div>
        <div className="flex items-center justify-between border-b-3 border-black pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#FFE500] border-2 border-black shadow-neo-sm">
              <Landmark className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black uppercase text-black tracking-tight">
                Opening Balance & Ledger
              </h2>
              <p className="text-xs font-mono font-semibold text-neutral-600">
                Auto-calculated transactional balance
              </p>
            </div>
          </div>
        </div>

        {/* Step-by-Step Ledger List */}
        <div className="space-y-3.5">
          {/* 1. Opening Balance */}
          <div className="bg-[#FFFDF5] border-2 border-black p-3 shadow-neo-sm">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="opening-balance-input" className="text-xs sm:text-sm font-black uppercase tracking-wide text-black flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-black text-white text-xs flex items-center justify-center font-mono">1</span>
                Opening Balance
              </label>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-lg text-black select-none">
                ₹
              </span>
              <input
                id="opening-balance-input"
                type="text"
                inputMode="decimal"
                value={ledger.openingBalance}
                onChange={(e) => handleInputChange('openingBalance', e)}
                placeholder="0"
                className="w-full bg-white border-2 border-black pl-8 pr-3 py-2 font-mono font-bold text-base sm:text-lg text-black focus:outline-none focus:bg-yellow-50 focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* 2. + Total Receipt */}
          <div className="bg-[#F0FDF4] border-2 border-black p-3 shadow-neo-sm">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="total-receipt-input" className="text-xs sm:text-sm font-black uppercase tracking-wide text-[#166534] flex items-center gap-1.5">
                <span className="w-5 h-5 bg-[#22C55E] text-white text-xs flex items-center justify-center font-mono font-bold border border-black">
                  <Plus className="w-3.5 h-3.5" />
                </span>
                Total Receipt (Prev Day 5PM - 12AM)
              </label>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-lg text-black select-none">
                ₹
              </span>
              <input
                id="total-receipt-input"
                type="text"
                inputMode="decimal"
                value={ledger.totalReceipt}
                onChange={(e) => handleInputChange('totalReceipt', e)}
                placeholder="0"
                className="w-full bg-white border-2 border-black pl-8 pr-3 py-2 font-mono font-bold text-base sm:text-lg text-black focus:outline-none focus:bg-yellow-50 focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* 3. = Subtotal 1 (Opening + Total Receipt) - Disabled */}
          <div className="bg-neutral-100 border-2 border-dashed border-black p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 bg-black text-white text-xs flex items-center justify-center font-mono font-bold">
                <Equal className="w-3 h-3" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-black">
                Total (Subtotal 1)
              </span>
            </div>
            <div className="font-mono font-black text-base sm:text-lg text-black">
              ₹ {formatINR(calculations.subtotal1)}
            </div>
          </div>

          {/* 4. - Payment */}
          <div className="bg-[#FEF2F2] border-2 border-black p-3 shadow-neo-sm">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="payment-input" className="text-xs sm:text-sm font-black uppercase tracking-wide text-[#991B1B] flex items-center gap-1.5">
                <span className="w-5 h-5 bg-[#EF4444] text-white text-xs flex items-center justify-center font-mono font-bold border border-black">
                  <Minus className="w-3.5 h-3.5" />
                </span>
                Payment (Prev Day 5PM - 12AM)
              </label>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-lg text-black select-none">
                ₹
              </span>
              <input
                id="payment-input"
                type="text"
                inputMode="decimal"
                value={ledger.payment}
                onChange={(e) => handleInputChange('payment', e)}
                placeholder="0"
                className="w-full bg-white border-2 border-black pl-8 pr-3 py-2 font-mono font-bold text-base sm:text-lg text-black focus:outline-none focus:bg-yellow-50 focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* 5. = Subtotal 2 (Subtotal 1 - Payment) - Disabled */}
          <div className="bg-neutral-100 border-2 border-dashed border-black p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 bg-black text-white text-xs flex items-center justify-center font-mono font-bold">
                <Equal className="w-3 h-3" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-black">
                Total (Subtotal 2)
              </span>
            </div>
            <div className="font-mono font-black text-base sm:text-lg text-black">
              ₹ {formatINR(calculations.subtotal2)}
            </div>
          </div>

          {/* 6. + Today's Receipt */}
          <div className="bg-[#F0FDF4] border-2 border-black p-3 shadow-neo-sm">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="todays-receipt-input" className="text-xs sm:text-sm font-black uppercase tracking-wide text-[#166534] flex items-center gap-1.5">
                <span className="w-5 h-5 bg-[#22C55E] text-white text-xs flex items-center justify-center font-mono font-bold border border-black">
                  <Plus className="w-3.5 h-3.5" />
                </span>
                Today's Receipt
              </label>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-lg text-black select-none">
                ₹
              </span>
              <input
                id="todays-receipt-input"
                type="text"
                inputMode="decimal"
                value={ledger.todaysReceipt}
                onChange={(e) => handleInputChange('todaysReceipt', e)}
                placeholder="0"
                className="w-full bg-white border-2 border-black pl-8 pr-3 py-2 font-mono font-bold text-base sm:text-lg text-black focus:outline-none focus:bg-yellow-50 focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* 7. = Subtotal 3 (Subtotal 2 + Today's Receipt) - Disabled */}
          <div className="bg-neutral-100 border-2 border-dashed border-black p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 bg-black text-white text-xs flex items-center justify-center font-mono font-bold">
                <Equal className="w-3 h-3" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-black">
                Total (Subtotal 3)
              </span>
            </div>
            <div className="font-mono font-black text-base sm:text-lg text-black">
              ₹ {formatINR(calculations.subtotal3)}
            </div>
          </div>

          {/* 8. - Today's Payment */}
          <div className="bg-[#FEF2F2] border-2 border-black p-3 shadow-neo-sm">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="todays-payment-input" className="text-xs sm:text-sm font-black uppercase tracking-wide text-[#991B1B] flex items-center gap-1.5">
                <span className="w-5 h-5 bg-[#EF4444] text-white text-xs flex items-center justify-center font-mono font-bold border border-black">
                  <Minus className="w-3.5 h-3.5" />
                </span>
                Today's Payment
              </label>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-lg text-black select-none">
                ₹
              </span>
              <input
                id="todays-payment-input"
                type="text"
                inputMode="decimal"
                value={ledger.todaysPayment}
                onChange={(e) => handleInputChange('todaysPayment', e)}
                placeholder="0"
                className="w-full bg-white border-2 border-black pl-8 pr-3 py-2 font-mono font-bold text-base sm:text-lg text-black focus:outline-none focus:bg-yellow-50 focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 9. Final Ledger Book Balance (Disabled Output) */}
      <div className="mt-6 pt-4 border-t-3 border-black">
        <div className="bg-[#FFE500] border-3 border-black p-4 shadow-neo">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-black flex items-center gap-1.5">
              <Equal className="w-4 h-4" />
              Final Ledger Balance
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-black text-right tracking-tight">
            ₹ {formatINR(calculations.finalTotal)}
          </div>
        </div>
      </div>
    </div>
  );
};
