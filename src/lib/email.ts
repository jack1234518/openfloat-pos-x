// src/lib/email.ts - No nodemailer dependency

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; simulated: boolean }> {
    console.log('📧 Email would be sent (SMTP not configured):', {
      to: options.to,
      subject: options.subject,
    });
    console.log('📧 Email HTML preview:', options.html.substring(0, 200) + '...');
    return { success: true, simulated: true };
  }

  async sendReceiptEmail(receiptData: any): Promise<{ success: boolean; simulated: boolean }> {
    if (!receiptData.customerEmail) {
      console.log('No customer email provided, skipping receipt email');
      return { success: false, simulated: true, reason: 'No email provided' };
    }

    console.log('📧 Receipt email would be sent to:', receiptData.customerEmail);
    console.log('📧 Receipt #:', receiptData.receiptNo);
    return { success: true, simulated: true };
  }

  async sendPayslipEmail(employee: any, payslip: any): Promise<{ success: boolean; simulated: boolean }> {
    if (!employee.email) {
      console.log('No employee email provided, skipping payslip email');
      return { success: false, simulated: true, reason: 'No email provided' };
    }

    console.log('📧 Payslip email would be sent to:', employee.email);
    console.log('📧 Employee:', employee.name);
    console.log('📧 Net Pay: KES', payslip.net);
    return { success: true, simulated: true };
  }
}

export const emailService = new EmailService();