// src/config/mpesa.ts

export const MPESA_CONFIG = {
  consumerKey: process.env.MPESA_CONSUMER_KEY || "YOUR_CONSUMER_KEY",
  consumerSecret: process.env.MPESA_CONSUMER_SECRET || "YOUR_CONSUMER_SECRET",
  shortCode: process.env.MPESA_SHORTCODE || "174379",
  passkey: process.env.MPESA_PASSKEY || "YOUR_PASSKEY",
  baseUrl: process.env.MPESA_ENV === "production" 
    ? "https://api.safaricom.co.ke" 
    : "https://sandbox.safaricom.co.ke",
  callbackUrl: process.env.MPESA_CALLBACK_URL || "http://localhost:3000/api/mpesa/callback",
  resultUrl: process.env.MPESA_RESULT_URL || "http://localhost:3000/api/mpesa/result",
  timeoutUrl: process.env.MPESA_TIMEOUT_URL || "http://localhost:3000/api/mpesa/timeout",
};

export const BUSINESS_SHORTCODES = {
  PAYBILL: "174379",
  TILL: "123456",
  BUYGOODS: "123456",
};