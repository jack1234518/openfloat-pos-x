// src/app/utils/export.ts

import * as XLSX from 'xlsx';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Your existing CSV export
export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }
  
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(h => {
      const value = row[h] || '';
      return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
    }).join(','))
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// Your existing JSON export
export function exportToJSON(data: any[], filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// NEW: Excel Export
export function exportToExcel(data: any[], filename: string) {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  // Auto column widths
  const columnWidths = Object.keys(data[0]).map(() => ({ wch: 15 }));
  worksheet['!cols'] = columnWidths;

  XLSX.writeFile(workbook, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`);
}

// NEW: PDF Export
export async function exportToPDF(data: any[], filename: string, columns?: string[]) {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([600, 800]);
  const { width, height } = page.getSize();

  let y = 750;

  // Title
  page.drawText(`Export: ${filename}`, {
    x: 50,
    y,
    font: fontBold,
    size: 18,
    color: rgb(0.1, 0.2, 0.3),
  });
  y -= 30;

  // Date
  page.drawText(`Generated: ${new Date().toLocaleString()}`, {
    x: 50,
    y,
    font: font,
    size: 10,
    color: rgb(0.5, 0.5, 0.5),
  });
  y -= 30;

  // Headers
  const headers = columns || Object.keys(data[0]);
  const colWidth = (width - 100) / headers.length;
  
  headers.forEach((col, i) => {
    page.drawText(col, {
      x: 50 + i * colWidth,
      y,
      font: fontBold,
      size: 10,
      color: rgb(1, 1, 1),
    });
  });
  y -= 15;

  // Data rows
  const rowsPerPage = 40;
  let currentRow = 0;
  let currentPage = page;

  for (const item of data) {
    if (currentRow > rowsPerPage) {
      // Add new page if needed
      currentPage = pdfDoc.addPage([600, 800]);
      y = 750;
      currentRow = 0;
    }

    const values = headers.map(col => String(item[col] || ''));
    values.forEach((value, i) => {
      currentPage.drawText(value.substring(0, 30), {
        x: 50 + i * colWidth,
        y,
        font: font,
        size: 8,
        color: rgb(0.2, 0.2, 0.2),
      });
    });

    y -= 15;
    currentRow++;
  }

  // Save PDF
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// NEW: Combined Export Button Component
export const EXPORT_FORMATS = [
  { key: 'csv', label: '📊 CSV', icon: '📊' },
  { key: 'json', label: '📄 JSON', icon: '📄' },
  { key: 'excel', label: '📈 Excel', icon: '📈' },
  { key: 'pdf', label: '📕 PDF', icon: '📕' },
];

export async function exportData(data: any[], filename: string, format: string, columns?: string[]) {
  switch (format) {
    case 'csv':
      exportToCSV(data, filename);
      break;
    case 'json':
      exportToJSON(data, filename);
      break;
    case 'excel':
      exportToExcel(data, filename);
      break;
    case 'pdf':
      await exportToPDF(data, filename, columns);
      break;
    default:
      alert('Unsupported export format');
  }
}