// Load JSON schematic files

import { Schematic, Term } from '@/types';

// Load schematics from JSON
export async function loadSchematics(): Promise<Schematic[]> {
  const response = await fetch('/data/schematics.json');
  return response.json();
}

// Load terms from JSON
export async function loadTerms(): Promise<Term[]> {
  const response = await fetch('/data/terms.json');
  return response.json();
}

// For server-side or build-time loading
import schematicsData from '@/data/schematics.json';
import termsData from '@/data/terms.json';

export const schematics: Schematic[] = schematicsData as Schematic[];
export const terms: Term[] = termsData as Term[];
