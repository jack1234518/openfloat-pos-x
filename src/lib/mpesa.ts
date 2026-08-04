// src/lib/mpesa.ts

import axios from 'axios';
import { MPESA_CONFIG } from '@/config/mpesa';

interface StkPushRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
  callbackUrl?: string;
}

class MpesaService {
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  private async getAccessToken(): Promise<string> {
    // Check if token is still valid
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const auth = Buffer.from(
        `${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`
      ).toString('base64');

      const response = await axios.get(
        `${MPESA_CONFIG.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );

      const data = response.data as any;
      const token = data.access_token as string;
      
      this.accessToken = token;
      this.tokenExpiry = new Date(Date.now() + parseInt(data.expires_in) * 1000);
      
      return token;
    } catch (error) {
      console.error('M-Pesa Auth Error:', error);
      throw new Error('Failed to authenticate with M-Pesa');
    }
  }

  async initiateStkPush({
    phoneNumber,
    amount,
    accountReference,
    transactionDesc,
    callbackUrl = MPESA_CONFIG.callbackUrl,
  }: StkPushRequest): Promise<any> {
    try {
      const token = await this.getAccessToken();

      // Format phone number (remove leading 0 or +254)
      const formattedPhone = phoneNumber.replace(/^0/, '254').replace(/^\+/, '');

      const timestamp = this.getTimestamp();
      const password = Buffer.from(
        `${MPESA_CONFIG.shortCode}${MPESA_CONFIG.passkey}${timestamp}`
      ).toString('base64');

      const requestBody = {
        BusinessShortCode: MPESA_CONFIG.shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: MPESA_CONFIG.shortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc,
      };

      const response = await axios.post(
        `${MPESA_CONFIG.baseUrl}/mpesa/stkpush/v1/processrequest`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('STK Push Error:', error);
      throw new Error('Failed to initiate STK push');
    }
  }

  async queryStkPushStatus(checkoutRequestId: string): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const timestamp = this.getTimestamp();
      const password = Buffer.from(
        `${MPESA_CONFIG.shortCode}${MPESA_CONFIG.passkey}${timestamp}`
      ).toString('base64');

      const requestBody = {
        BusinessShortCode: MPESA_CONFIG.shortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      };

      const response = await axios.post(
        `${MPESA_CONFIG.baseUrl}/mpesa/stkpushquery/v1/query`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('STK Query Error:', error);
      throw new Error('Failed to query STK status');
    }
  }

  private getTimestamp(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }
}

export const mpesaService = new MpesaService();