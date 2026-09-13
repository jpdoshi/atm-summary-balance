export type DenominationValue = 2000 | 500 | 200 | 100 | 50 | 20 | 10 | 5 | 2 | 1;

export const STANDARD_DENOMINATIONS: DenominationValue[] = [2000, 500, 200, 100, 50, 20, 10, 5];
export const EXTRA_DENOMINATIONS: DenominationValue[] = [2, 1];

export interface LedgerFormState {
  openingBalance: string;
  totalReceipt: string;
  payment: string;
  todaysReceipt: string;
  todaysPayment: string;
}

export interface LedgerCalculated {
  subtotal1: number; // Opening Balance + Total Receipt
  subtotal2: number; // Subtotal 1 - Payment
  subtotal3: number; // Subtotal 2 + Today's Receipt
  finalTotal: number; // Subtotal 3 - Today's Payment
}

export type DenominationCounts = Record<number, string | number>;

export interface ATMRecord {
  id: string;
  date: string; // YYYY-MM-DD
  atmId?: string;
  branchName?: string;
  operatorName?: string;
  remarks?: string;
  ledger: {
    openingBalance: number;
    totalReceipt: number;
    payment: number;
    todaysReceipt: number;
    todaysPayment: number;
  };
  denominations: Record<number, number>;
  calculations: {
    subtotal1: number;
    subtotal2: number;
    subtotal3: number;
    ledgerTotal: number;
    notesTotal: number;
    totalNotesCount: number;
    difference: number;
    isMatched: boolean;
  };
  amountInWords: string;
  createdAt: string;
  updatedAt: string;
}
