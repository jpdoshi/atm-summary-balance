import { jsPDF } from 'jspdf';
import type { ATMRecord } from '../types/atm';
import { formatINR } from './numberToWords';

export function generateATMSummaryPDF(record: ATMRecord, download = true): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 18;

  // Title Box (Neo-brutalist styled black border with yellow fill)
  doc.setFillColor(255, 229, 0); // Neo yellow
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.8);
  doc.rect(margin, y, pageWidth - margin * 2, 22, 'FD');

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('ATM BALANCE SUMMARY & RECONCILIATION', margin + 6, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(`DATE: ${record.date}  |  STATUS: ${record.calculations.isMatched ? 'MATCHED (TALLIED)' : 'MISMATCH (DISCREPANCY)'}`, margin + 6, y + 15);

  y += 28;

  // Metadata Row
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`RECORD ID: ${record.id}`, margin, y);
  doc.setFont('helvetica', 'normal');
  const genTime = new Date().toLocaleString('en-IN');
  doc.text(`GENERATED: ${genTime}`, pageWidth - margin - doc.getTextWidth(`GENERATED: ${genTime}`), y);

  y += 6;
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Two Column Layout for Ledger & Notes
  const colWidth = (pageWidth - margin * 2 - 8) / 2;
  const leftX = margin;
  const rightX = margin + colWidth + 8;

  // LEFT COLUMN: LEDGER / OPENING BALANCE
  doc.setFillColor(245, 245, 245);
  doc.rect(leftX, y, colWidth, 9, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('1. OPENING BALANCE LEDGER', leftX + 4, y + 6);

  let ledgerY = y + 14;
  const ledgerItems = [
    { label: 'Opening Balance', sign: '', value: record.ledger.openingBalance, bold: false },
    { label: 'Total Receipt', sign: '+', value: record.ledger.totalReceipt, bold: false },
    { label: 'Subtotal 1', sign: '=', value: record.calculations.subtotal1, bold: true, highlight: true },
    { label: 'Payment', sign: '-', value: record.ledger.payment, bold: false },
    { label: 'Subtotal 2', sign: '=', value: record.calculations.subtotal2, bold: true, highlight: true },
    { label: "Today's Receipt", sign: '+', value: record.ledger.todaysReceipt, bold: false },
    { label: 'Subtotal 3', sign: '=', value: record.calculations.subtotal3, bold: true, highlight: true },
    { label: "Today's Payment", sign: '-', value: record.ledger.todaysPayment, bold: false },
    { label: 'FINAL LEDGER TOTAL', sign: '=', value: record.calculations.ledgerTotal, bold: true, total: true },
  ];

  ledgerItems.forEach((item) => {
    if (item.total) {
      doc.setFillColor(255, 235, 150);
      doc.rect(leftX, ledgerY - 4, colWidth, 8, 'FD');
    } else if (item.highlight) {
      doc.setFillColor(238, 242, 255);
      doc.rect(leftX, ledgerY - 4, colWidth, 7, 'F');
    }

    doc.setFont('helvetica', item.bold ? 'bold' : 'normal');
    doc.setFontSize(item.total ? 9.5 : 8.5);

    const signPrefix = item.sign ? `[${item.sign}] ` : '    ';
    doc.text(`${signPrefix}${item.label}:`, leftX + 2, ledgerY + 1);

    const valStr = `Rs. ${formatINR(item.value)}`;
    doc.text(valStr, leftX + colWidth - 3 - doc.getTextWidth(valStr), ledgerY + 1);

    ledgerY += item.total ? 10 : 8;
  });

  // RIGHT COLUMN: PHYSICAL CURRENCY NOTES TALLY
  doc.setFillColor(245, 245, 245);
  doc.rect(rightX, y, colWidth, 9, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('2. PHYSICAL CASH (NOTES TALLY)', rightX + 4, y + 6);

  let notesY = y + 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Note', rightX + 3, notesY);
  doc.text('Count', rightX + 24, notesY);
  doc.text('Total (Rs.)', rightX + colWidth - 20, notesY);
  notesY += 3;
  doc.line(rightX, notesY, rightX + colWidth, notesY);
  notesY += 4;

  const denominationsList = [2000, 500, 200, 100, 50, 20, 10, 5];
  // check if 2 or 1 have counts
  if (record.denominations[2]) denominationsList.push(2);
  if (record.denominations[1]) denominationsList.push(1);

  denominationsList.forEach((denom) => {
    const count = record.denominations[denom] || 0;
    const amount = denom * count;

    doc.setFont('helvetica', count > 0 ? 'bold' : 'normal');
    doc.setFontSize(8.5);

    doc.text(`Rs. ${denom}`, rightX + 3, notesY);
    doc.text(`x ${count}`, rightX + 26, notesY);
    const amtStr = formatINR(amount);
    doc.text(amtStr, rightX + colWidth - 3 - doc.getTextWidth(amtStr), notesY);

    notesY += 6.5;
  });

  // Notes Total Row
  doc.setFillColor(230, 255, 230);
  doc.rect(rightX, notesY - 2, colWidth, 8, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(`TOTAL CASH: (${record.calculations.totalNotesCount} pcs)`, rightX + 3, notesY + 3.5);
  const totalNotesAmt = `Rs. ${formatINR(record.calculations.notesTotal)}`;
  doc.text(totalNotesAmt, rightX + colWidth - 3 - doc.getTextWidth(totalNotesAmt), notesY + 3.5);

  const bottomContentY = Math.max(ledgerY, notesY + 12) + 4;

  // 3. RECONCILIATION STATUS BOX
  y = bottomContentY;
  const isMatched = record.calculations.isMatched;

  if (isMatched) {
    doc.setFillColor(212, 250, 219); // Light green
    doc.setDrawColor(22, 101, 52);
  } else {
    doc.setFillColor(254, 226, 226); // Light red
    doc.setDrawColor(185, 28, 28);
  }

  doc.setLineWidth(0.8);
  doc.rect(margin, y, pageWidth - margin * 2, 24, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  if (isMatched) {
    doc.setTextColor(22, 101, 52);
    doc.text('STATUS: BALANCED & RECONCILED (0.00 DIFFERENCE)', margin + 6, y + 8);
  } else {
    doc.setTextColor(185, 28, 28);
    const diff = record.calculations.difference;
    const diffText = diff > 0 ? `Rs. ${formatINR(diff)} (PHYSICAL CASH EXCESS)` : `Rs. ${formatINR(Math.abs(diff))} (SHORTAGE / DEFICIT)`;
    doc.text(`STATUS: MISMATCH DETECTED - DIFFERENCE: ${diffText}`, margin + 6, y + 8);
  }

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Ledger Book Total: Rs. ${formatINR(record.calculations.ledgerTotal)}   |   ATM Physical Cash: Rs. ${formatINR(record.calculations.notesTotal)}`, margin + 6, y + 14);
  doc.text(`Amount in Words: ${record.amountInWords || 'N/A'}`, margin + 6, y + 20);

  // Signatures Section
  y += 38;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  const sigWidth = (pageWidth - margin * 2) / 3;

  doc.line(margin + 5, y, margin + sigWidth - 10, y);
  doc.text('Cashier / Custodian', margin + 5, y + 5);

  doc.line(margin + sigWidth + 5, y, margin + sigWidth * 2 - 10, y);
  doc.text('Verified By / Supervisor', margin + sigWidth + 5, y + 5);

  doc.line(margin + sigWidth * 2 + 5, y, pageWidth - margin - 5, y);
  doc.text('Branch Manager / Auditor', margin + sigWidth * 2 + 5, y + 5);

  // Footer
  y += 18;
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text('Generated via ATM Balance Summary App. Valid for internal bank reconciliation records.', margin, y);

  if (download) {
    doc.save(`ATM_Balance_${record.date}.pdf`);
  }

  return doc;
}

export async function shareSummaryText(record: ATMRecord): Promise<void> {
  const summaryText = `*ATM BALANCE SUMMARY - ${record.date}*
----------------------------------------
Ledger Total: Rs. ${formatINR(record.calculations.ledgerTotal)}
Cash Count Total: Rs. ${formatINR(record.calculations.notesTotal)} (${record.calculations.totalNotesCount} notes)
Status: ${record.calculations.isMatched ? 'MATCHED' : `MISMATCH (Diff: Rs. ${formatINR(record.calculations.difference)})`}
Amount in words: ${record.amountInWords}
----------------------------------------
Generated via ATM Balance Summary App`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: `ATM Balance Summary - ${record.date}`,
        text: summaryText,
      });
      return;
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.warn('Share error', err);
      }
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(summaryText);
    alert('Summary copied to clipboard!');
  } catch {
    alert(summaryText);
  }
}
