// Deprecated — use loadSchematics.ts instead
// Kept for reference only

import { Schematic, Term } from '@/types';

export async function loadSchematics(): Promise<Schematic[]> {
  const response = await fetch('/data/schematics.json');
  return response.json();
}

export async function loadTerms(): Promise<Term[]> {
  const response = await fetch('/data/terms.json');
  return response.json();
}
