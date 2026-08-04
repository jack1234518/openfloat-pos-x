import { NextRequest, NextResponse } from 'next/server';
import { mpesaService } from '@/lib/mpesa';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, amount, accountReference, transactionDesc } = body;

    const result = await mpesaService.initiateStkPush({
      phoneNumber,
      amount,
      accountReference,
      transactionDesc: transactionDesc || 'Payment to OpenFloat POS',
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}