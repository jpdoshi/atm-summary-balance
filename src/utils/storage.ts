import type { ATMRecord } from '../types/atm';

const STORAGE_KEY = 'atm_balance_records_v1';

function isStorageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getAllRecords(): ATMRecord[] {
  if (!isStorageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list: ATMRecord[] = JSON.parse(raw);
    return Array.isArray(list) ? list.sort((a, b) => b.date.localeCompare(a.date)) : [];
  } catch (err) {
    console.error('Failed to parse records from localStorage', err);
    return [];
  }
}

export function getRecordByDate(date: string): ATMRecord | undefined {
  const records = getAllRecords();
  return records.find((r) => r.date === date);
}

export function saveRecord(record: ATMRecord): ATMRecord[] {
  const records = getAllRecords();
  const existingIndex = records.findIndex((r) => r.date === record.date || r.id === record.id);

  if (existingIndex >= 0) {
    records[existingIndex] = {
      ...record,
      updatedAt: new Date().toISOString(),
    };
  } else {
    records.unshift({
      ...record,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Sort by date descending
  records.sort((a, b) => b.date.localeCompare(a.date));

  if (isStorageAvailable()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (err) {
      console.error('Failed to save record to localStorage', err);
    }
  }

  return records;
}

export function deleteRecord(id: string): ATMRecord[] {
  const records = getAllRecords().filter((r) => r.id !== id);
  if (isStorageAvailable()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (err) {
      console.error('Failed to delete record from localStorage', err);
    }
  }
  return records;
}

export function clearAllRecords(): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear records', err);
  }
}

export function exportToJSON(): string {
  const records = getAllRecords();
  const exportPayload = {
    app: 'atm-balance-summary',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    recordsCount: records.length,
    records,
  };
  return JSON.stringify(exportPayload, null, 2);
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importFromJSON(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    const recordsToImport: ATMRecord[] = Array.isArray(data)
      ? data
      : Array.isArray(data.records)
      ? data.records
      : null;

    if (!recordsToImport) {
      return { success: false, count: 0, error: 'Invalid file format. Expected an array of records.' };
    }

    const currentRecords = getAllRecords();
    const map = new Map<string, ATMRecord>();

    // Current records
    currentRecords.forEach((r) => {
      map.set(r.date, r);
    });

    // Merge or overwrite with imported
    let importedCount = 0;
    recordsToImport.forEach((rec) => {
      if (rec && rec.date) {
        map.set(rec.date, rec);
        importedCount++;
      }
    });

    const merged = Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
    if (isStorageAvailable()) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    }

    return { success: true, count: importedCount };
  } catch (err) {
    return { success: false, count: 0, error: (err as Error).message || 'Failed to parse JSON file' };
  }
}

export function exportToCSV(): string {
  const records = getAllRecords();
  if (records.length === 0) {
    return 'No records available';
  }

  const headers = [
    'Date',
    'Opening Balance',
    'Total Receipt (+)',
    'Subtotal 1',
    'Payment (-)',
    'Subtotal 2',
    'Todays Receipt (+)',
    'Subtotal 3',
    'Todays Payment (-)',
    'Final Ledger Total',
    'Notes Total (Physical)',
    'Discrepancy (Diff)',
    'Status',
    'Count 2000',
    'Count 500',
    'Count 200',
    'Count 100',
    'Count 50',
    'Count 20',
    'Count 10',
    'Count 5',
    'Amount In Words',
  ];

  const rows = records.map((r) => [
    `"${r.date}"`,
    r.ledger.openingBalance,
    r.ledger.totalReceipt,
    r.calculations.subtotal1,
    r.ledger.payment,
    r.calculations.subtotal2,
    r.ledger.todaysReceipt,
    r.calculations.subtotal3,
    r.ledger.todaysPayment,
    r.calculations.ledgerTotal,
    r.calculations.notesTotal,
    r.calculations.difference,
    r.calculations.isMatched ? 'MATCHED' : 'MISMATCH',
    r.denominations[2000] || 0,
    r.denominations[500] || 0,
    r.denominations[200] || 0,
    r.denominations[100] || 0,
    r.denominations[50] || 0,
    r.denominations[20] || 0,
    r.denominations[10] || 0,
    r.denominations[5] || 0,
    `"${(r.amountInWords || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}
