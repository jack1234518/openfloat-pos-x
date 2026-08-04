// src/app/utils/pdf.ts

import { pdf } from '@react-pdf/renderer';
import { ReceiptPDF } from '@/app/components/pdf/ReceiptPDF';

export async function generateReceiptPDF(receiptData: any): Promise<Blob> {
  // Use the component directly, not as a type
  const blob = await pdf(ReceiptPDF({ receiptData })).toBlob();
  return blob;
}

export async function downloadReceiptPDF(receiptData: any): Promise<void> {
  const blob = await generateReceiptPDF(receiptData);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `receipt-${receiptData.receiptNo || 'download'}-${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}