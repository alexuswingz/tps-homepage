import { NextResponse } from 'next/server';
import { houseplantsList } from '@/lib/productLists';

export const dynamic = "force-static";

export async function GET() {
  // Return the houseplants list as plain text
  return new NextResponse(houseplantsList.join('\n'), {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
} 