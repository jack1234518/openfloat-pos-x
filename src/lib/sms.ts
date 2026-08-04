// src/lib/sms.ts

interface SMSPayload {
  to: string | string[];
  message: string;
}

class SMSService {
  constructor() {
    console.log('📱 SMS Service initialized');
  }

  async sendSMS({ to, message }: SMSPayload): Promise<{ success: boolean; simulated: boolean }> {
    console.log('📱 SMS would be sent:', {
      to,
      message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
    });
    return { success: true, simulated: true };
  }

  async sendReceiptSMS(phoneNumber: string, receiptData: any): Promise<{ success: boolean; simulated: boolean; reason?: string }> {
    if (!phoneNumber) {
      return { success: false, simulated: true, reason: 'No phone number provided' };
    }

    const message = `
OpenFloat POS X - Receipt #${receiptData.receiptNo}
Total: KES ${receiptData.total.toLocaleString()}
Payment: ${receiptData.paymentMethod}
Thank you for your business!
    `.trim();

    return this.sendSMS({ to: phoneNumber, message });
  }

  async sendInvoiceReminderSMS(phoneNumber: string, invoiceData: any): Promise<{ success: boolean; simulated: boolean; reason?: string }> {
    if (!phoneNumber) {
      return { success: false, simulated: true, reason: 'No phone number provided' };
    }

    const message = `
OpenFloat POS X - Payment Reminder
Invoice #${invoiceData.invoiceNo}
Amount Due: KES ${invoiceData.total.toLocaleString()}
Please make payment.
    `.trim();

    return this.sendSMS({ to: phoneNumber, message });
  }

  async sendPayrollNotificationSMS(phoneNumber: string, employeeName: string, payslip: any): Promise<{ success: boolean; simulated: boolean; reason?: string }> {
    if (!phoneNumber) {
      return { success: false, simulated: true, reason: 'No phone number provided' };
    }

    const message = `
OpenFloat POS X - Payslip Notification
Employee: ${employeeName}
Net Pay: KES ${payslip.net.toLocaleString()}
Please check your email for detailed payslip.
    `.trim();

    return this.sendSMS({ to: phoneNumber, message });
  }

  async sendLowStockAlertSMS(phoneNumber: string, productData: any): Promise<{ success: boolean; simulated: boolean; reason?: string }> {
    if (!phoneNumber) {
      return { success: false, simulated: true, reason: 'No phone number provided' };
    }

    const message = `
OpenFloat POS X - Stock Alert
Product: ${productData.name}
Current Stock: ${productData.stock}
Action Required: Please reorder.
    `.trim();

    return this.sendSMS({ to: phoneNumber, message });
  }
}

export const smsService = new SMSService();