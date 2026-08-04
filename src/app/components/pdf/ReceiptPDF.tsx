// src/app/components/pdf/ReceiptPDF.tsx

'use client';

import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

interface ReceiptPDFProps {
  receiptData: {
    receiptNo: string;
    date: string;
    customerName: string;
    items: Array<{ name: string; quantity: number; price: number; total: number }>;
    subtotal: number;
    discount: number;
    total: number;
    paymentMethod: string;
    branch: string;
  };
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    borderBottom: '2px solid #1e293b',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    fontSize: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    color: '#ffffff',
    padding: 8,
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: 8,
    fontSize: 9,
  },
  totalSection: {
    marginTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#1e293b',
    paddingTop: 10,
    textAlign: 'right',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  footer: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
});

export function ReceiptPDF({ receiptData }: ReceiptPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>OpenFloat POS X</Text>
          <Text style={styles.subtitle}>{receiptData.branch}</Text>
          <Text style={styles.subtitle}>Receipt #{receiptData.receiptNo}</Text>
        </View>

        {/* Receipt Info */}
        <View>
          <View style={styles.infoRow}>
            <Text>Date:</Text>
            <Text>{receiptData.date}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text>Customer:</Text>
            <Text>{receiptData.customerName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text>Payment Method:</Text>
            <Text>{receiptData.paymentMethod}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View>
          <View style={styles.tableHeader}>
            <Text style={{ flex: 3 }}>Item</Text>
            <Text style={{ flex: 1, textAlign: 'center' }}>Qty</Text>
            <Text style={{ flex: 2, textAlign: 'right' }}>Amount</Text>
          </View>
          {receiptData.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={{ flex: 3 }}>{item.name}</Text>
              <Text style={{ flex: 1, textAlign: 'center' }}>{item.quantity}</Text>
              <Text style={{ flex: 2, textAlign: 'right' }}>KES {item.total.toLocaleString()}</Text>
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={styles.totalSection}>
          <View style={styles.infoRow}>
            <Text>Subtotal:</Text>
            <Text>KES {receiptData.subtotal.toLocaleString()}</Text>
          </View>
          {receiptData.discount > 0 && (
            <View style={styles.infoRow}>
              <Text style={{ color: '#ef4444' }}>Discount:</Text>
              <Text style={{ color: '#ef4444' }}>- KES {receiptData.discount.toLocaleString()}</Text>
            </View>
          )}
          <Text style={styles.totalText}>Total: KES {receiptData.total.toLocaleString()}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>✅ Payment Successful</Text>
          <Text>Thank you for your business!</Text>
          <Text>Powered by OpenFloat POS X</Text>
        </View>
      </Page>
    </Document>
  );
}