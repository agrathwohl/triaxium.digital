// Braxtonian Schematic Types

export interface Term {
  id: string;
  abbreviation: string;
  expansion: string;
  category: TermCategory;
  volume: 1 | 2 | 3;
  definition: string;
}

export type TermCategory = 
  | 'affinity'
  | 'information'
  | 'reality'
  | 'social-reality'
  | 'transformation'
  | 'multi'
  | 'composite'
  | 'vibrational'
  | 'isolated'
  | 'meta'
  | 'other';

export interface Schematic {
  id: string;
  volume: 1 | 2 | 3;
  section: string;
  page: number;
  subject: string;
  title: string;
  type: SchematicType;
  description?: string;
  terms: SchematicTerm[];
  relationships: Relationship[];
}

export type SchematicType = 
  | 'tree'
  | 'network'
  | 'horizontal'
  | 'crossing'
  | 'hub-spoke'
  | 'angled-tree';

export interface SchematicTerm {
  termId: string;
  isSubject?: boolean;
  prefix?: 'c' | 'r' | 'R' | 'p' | 'dt';
  // x, y are optional - will be calculated by layout algorithm if not provided
  x?: number;
  y?: number;
}

export interface Relationship {
  from: string;
  to: string;
  type: 'solid' | 'dashed' | 'thick';
  label?: string;
}

export type ViewMode = 'tree' | 'network' | 'workspace';

export interface UserSchematic {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  schematic: Schematic;
}
