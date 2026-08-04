// src/lib/email.ts

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

interface ReceiptItem {
  product: {
    name: string;
    price: number;
  };
  quantity: number;
}

interface ReceiptData {
  customerEmail?: string;
  receiptNo: string;
  customerName: string;
  items: ReceiptItem[];
  total: number;
  paymentMethod: string;
  date: string;
  branch?: string;
}

interface PayslipData {
  gross: number;
  net: number;
  basic: number;
  house: number;
  trans: number;
  paye: number;
  nssf: number;
  shif: number;
}

interface EmployeeData {
  name: string;
  email: string;
  role: string;
}

class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    } else {
      console.warn('⚠️ SMTP credentials not configured. Email service will use console.log fallback.');
    }
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; simulated?: boolean }> {
    const from = process.env.SMTP_FROM || 'OpenFloat POS X <noreply@openfloat.com>';

    try {
      // If SMTP is not configured, log the email instead
      if (!this.transporter) {
        console.log('📧 Email would be sent (SMTP not configured):', {
          to: options.to,
          subject: options.subject,
          html: options.html.substring(0, 200) + '...',
        });
        return { success: true, simulated: true };
      }

      const mailOptions = {
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
      };

      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email send error:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendReceiptEmail(receiptData: ReceiptData): Promise<{ success: boolean; messageId?: string; simulated?: boolean }> {
    const { customerEmail, receiptNo, customerName, items, total, paymentMethod, date, branch } = receiptData;

    if (!customerEmail) {
      console.log('No customer email provided, skipping receipt email');
      return { success: false, simulated: true };
    }

    const itemsHtml = items.map((item: ReceiptItem) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.product.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">KES ${(item.product.price * item.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .header { background: #1e293b; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .receipt-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th { background: #1e293b; color: white; padding: 10px; text-align: left; }
          .total { font-size: 20px; font-weight: bold; text-align: right; margin-top: 15px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; }
          .success { color: #10b981; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>OpenFloat POS X</h1>
          <p>${branch || 'Nairobi HQ'}</p>
        </div>
        <div class="content">
          <h2>Receipt #${receiptNo}</h2>
          <div class="receipt-info">
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="total">
            <p>Total: <strong>KES ${total.toLocaleString()}</strong></p>
          </div>
          
          <p style="text-align: center; margin-top: 20px; color: #10b981;">
            ✅ Payment Successful
          </p>
        </div>
        <div class="footer">
          <p>Thank you for your business! Powered by OpenFloat POS X</p>
        </div>
      </body>
      </html>
    `;

    const text = `
OpenFloat POS X - Receipt #${receiptNo}
Date: ${date}
Customer: ${customerName}
Payment Method: ${paymentMethod}
Total: KES ${total.toLocaleString()}
✅ Payment Successful
Thank you for your business!
    `;

    return this.sendEmail({
      to: customerEmail,
      subject: `OpenFloat POS X - Receipt #${receiptNo}`,
      html,
      text,
    });
  }

  async sendPayslipEmail(employee: EmployeeData, payslip: PayslipData): Promise<{ success: boolean; messageId?: string; simulated?: boolean }> {
    if (!employee.email) {
      console.log('No employee email provided, skipping payslip email');
      return { success: false, simulated: true };
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .header { background: #1e293b; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .total { font-size: 20px; font-weight: bold; text-align: right; margin-top: 15px; }
          .positive { color: #10b981; }
          .negative { color: #ef4444; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>OpenFloat POS X</h1>
          <p>Payslip</p>
        </div>
        <div class="content">
          <h2>Payslip for ${employee.name}</h2>
          <div class="info">
            <p><strong>Employee:</strong> ${employee.name}</p>
            <p><strong>Role:</strong> ${employee.role}</p>
          </div>
          
          <h3>Earnings</h3>
          <table>
            <tr><td>Basic Salary</td><td style="text-align: right;">KES ${payslip.basic.toLocaleString()}</td></tr>
            <tr><td>House Allowance</td><td style="text-align: right;">KES ${payslip.house.toLocaleString()}</td></tr>
            <tr><td>Transport Allowance</td><td style="text-align: right;">KES ${payslip.trans.toLocaleString()}</td></tr>
            <tr style="font-weight: bold; border-top: 2px solid #333;"><td>Gross Pay</td><td style="text-align: right;">KES ${payslip.gross.toLocaleString()}</td></tr>
          </table>
          
          <h3>Deductions</h3>
          <table>
            <tr><td>PAYE</td><td style="text-align: right; color: #ef4444;">KES ${payslip.paye.toLocaleString()}</td></tr>
            <tr><td>NSSF</td><td style="text-align: right; color: #ef4444;">KES ${payslip.nssf.toLocaleString()}</td></tr>
            <tr><td>SHIF</td><td style="text-align: right; color: #ef4444;">KES ${payslip.shif.toLocaleString()}</td></tr>
          </table>
          
          <div style="text-align: right; margin-top: 20px; font-size: 24px; font-weight: bold; color: #10b981;">
            Net Pay: KES ${payslip.net.toLocaleString()}
          </div>
        </div>
        <div class="footer">
          <p>Powered by OpenFloat POS X</p>
        </div>
      </body>
      </html>
    `;

    const text = `
OpenFloat POS X - Payslip for ${employee.name}
Gross Pay: KES ${payslip.gross.toLocaleString()}
Net Pay: KES ${payslip.net.toLocaleString()}
    `;

    return this.sendEmail({
      to: employee.email,
      subject: `Payslip for ${employee.name}`,
      html,
      text,
    });
  }
}

export const emailService = new EmailService();