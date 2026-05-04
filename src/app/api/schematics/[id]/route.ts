import { NextResponse } from 'next/server';
import { schematics } from '@/data/schematics-full';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const schematic = schematics.find(s => s.id === id);

  if (!schematic) {
    return NextResponse.json({ error: 'Schematic not found' }, { status: 404 });
  }

  return NextResponse.json(schematic);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  return NextResponse.json({ id, ...body });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json({ deleted: id });
}
