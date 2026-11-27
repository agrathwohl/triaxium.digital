import { NextResponse } from 'next/server';
import { loadAllSchematics } from '@/lib/loadSchematics';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const schematic = loadAllSchematics().find(s => s.id === id);

  if (!schematic) {
    return NextResponse.json({ error: 'Schematic not found' }, { status: 404 });
  }

  return NextResponse.json(schematic);
}
