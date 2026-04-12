// Neo4j Database Connection Placeholder
// In production, this would connect to your Neo4j instance

import { Schematic, Term } from '@/types';

// Mock data for development
import { schematics as mockSchematics, terms as mockTerms } from '@/data/schematics';

export async function getSchematics(): Promise<Schematic[]> {
  // In production: 
  // const driver = neo4j.driver(process.env.NEO4J_URI, neo4j.auth.basic(...));
  // const session = driver.session();
  // const result = await session.run('MATCH (s:Schematic) RETURN s');
  
  // For now, return mock data:
  return Promise.resolve(mockSchematics);
}

export async function getTerms(): Promise<Term[]> {
  return Promise.resolve(mockTerms);
}

export async function getSchematicsByTerm(termId: string): Promise<Schematic[]> {
  // In production:
  // MATCH (t:Term {id: $termId})<-[:CONTAINS]-(s:Schematic) RETURN s
  return Promise.resolve(
    mockSchematics.filter(s => s.terms.some(t => t.termId === termId))
  );
}

export async function searchSchematics(query: string): Promise<Schematic[]> {
  return Promise.resolve(
    mockSchematics.filter(s => 
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.description?.toLowerCase().includes(query.toLowerCase())
    )
  );
}
