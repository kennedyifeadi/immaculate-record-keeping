import { NextResponse } from 'next/server';

export async function GET() {
  // This route exists to satisfy Next.js/Vercel when scanning app routes.
  // Implement actual cron/email logic here or import from a server action.
  return NextResponse.json({ ok: true, message: 'placeholder' });
}
