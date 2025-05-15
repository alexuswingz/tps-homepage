import { NextResponse } from 'next/server';
import { gardenPlantsList } from '@/lib/productLists';

export const dynamic = "force-static";

export async function GET() {
  // Return the garden plants list as plain text
  return new NextResponse(gardenPlantsList.join('\n'), {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
} 