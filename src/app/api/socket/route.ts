// src/app/api/socket/route.ts

import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  // Socket.io upgrade is handled by the server
  return new Response('Socket.io endpoint', { status: 200 });
}

// For WebSocket upgrade
export const dynamic = 'force-dynamic';