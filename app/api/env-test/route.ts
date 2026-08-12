import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    clientId: process.env.JDOODLE_CLIENT_ID || "MISSING",
    clientSecret: process.env.JDOODLE_CLIENT_SECRET ? "EXISTS" : "MISSING"
  });
}
