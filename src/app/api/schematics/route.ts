import { NextResponse } from 'next/server';
import { loadAllSchematics } from '@/lib/loadSchematics';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const volume = searchParams.get('volume');
  const section = searchParams.get('section');
  const search = searchParams.get('search');

  let filtered = loadAllSchematics();

  if (volume) {
    filtered = filtered.filter(s => s.volume === parseInt(volume));
  }

  if (section) {
    filtered = filtered.filter(s => s.section.toLowerCase().includes(section.toLowerCase()));
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(s => 
      s.title.toLowerCase().includes(searchLower) ||
      s.subject.toLowerCase().includes(searchLower) ||
      s.description?.toLowerCase().includes(searchLower)
    );
  }

  return NextResponse.json(filtered);
}
