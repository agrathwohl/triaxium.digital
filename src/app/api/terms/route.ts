import { NextResponse } from 'next/server';
import { terms } from '@/data/schematics-full';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const volume = searchParams.get('volume');
  const search = searchParams.get('search');

  let filtered = terms;

  if (category) {
    filtered = filtered.filter(t => t.category === category);
  }

  if (volume) {
    filtered = filtered.filter(t => t.volume === parseInt(volume));
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(t => 
      t.abbreviation.toLowerCase().includes(searchLower) ||
      t.expansion.toLowerCase().includes(searchLower) ||
      t.definition.toLowerCase().includes(searchLower)
    );
  }

  return NextResponse.json(filtered);
}
