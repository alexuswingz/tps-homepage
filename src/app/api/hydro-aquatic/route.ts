import { NextResponse } from 'next/server';
import { hydroAquaticList } from '@/lib/productLists';

export const dynamic = "force-static";

export async function GET() {
  // Return the hydro-aquatic plants list as plain text
  return new NextResponse(hydroAquaticList.join('\n'), {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
} 