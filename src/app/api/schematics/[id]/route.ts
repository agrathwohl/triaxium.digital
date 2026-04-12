import { NextResponse } from 'next/server';
import { schematics } from '@/data/schematics-full';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const schematic = schematics.find(s => s.id === params.id);
  
  if (!schematic) {
    return NextResponse.json({ error: 'Schematic not found' }, { status: 404 });
  }

  return NextResponse.json(schematic);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  
  // In production, this would update database
  // For now, just return the updated schematic
  return NextResponse.json({ id: params.id, ...body });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // In production, this would delete from database
  return NextResponse.json({ deleted: params.id });
}
