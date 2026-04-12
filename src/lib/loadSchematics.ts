import fs from 'fs';
import path from 'path';
import { Schematic } from '@/types';

/**
 * Load all schematic JSON files from data/schematics/ at build/request time.
 * Server-side only (uses fs).
 */
export function loadAllSchematics(): Schematic[] {
  const dir = path.join(process.cwd(), 'data', 'schematics');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

  const schematics: Schematic[] = [];

  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
      schematics.push(JSON.parse(raw));
    } catch {
      console.error(`Failed to parse ${file}`);
    }
  }

  // Sort: volume asc, then page asc
  schematics.sort((a, b) => a.volume - b.volume || a.page - b.page);

  return schematics;
}
