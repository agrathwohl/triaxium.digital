// TypeScript import script for Neo4j
// Run with: npx ts-node scripts/import.ts

import neo4j from 'neo4j-driver';
import { terms, schematics } from '../src/data/schematics-full';

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'braxton'
  )
);

async function importData() {
  const session = driver.session();

  try {
    console.log('Clearing existing data...');
    await session.run('MATCH (n) DETACH DELETE n');

    console.log('Creating constraints...');
    await session.run(`
      CREATE CONSTRAINT term_abbreviation IF NOT EXISTS
      FOR (t:Term) REQUIRE t.abbreviation IS UNIQUE
    `);
    await session.run(`
      CREATE CONSTRAINT schematic_id IF NOT EXISTS
      FOR (s:Schematic) REQUIRE s.id IS UNIQUE
    `);

    console.log(`Importing ${terms.length} terms...`);
    for (const term of terms) {
      await session.run(`
        CREATE (t:Term {
          id: $id,
          abbreviation: $abbreviation,
          expansion: $expansion,
          category: $category,
          volume: $volume,
          definition: $definition
        })
      `, term);
    }

    console.log(`Importing ${schematics.length} schematics...`);
    for (const schematic of schematics) {
      await session.run(`
        CREATE (s:Schematic {
          id: $id,
          volume: $volume,
          section: $section,
          page: $page,
          subject: $subject,
          title: $title,
          type: $type,
          description: $description
        })
      `, {
        id: schematic.id,
        volume: schematic.volume,
        section: schematic.section,
        page: schematic.page,
        subject: schematic.subject,
        title: schematic.title,
        type: schematic.type,
        description: schematic.description || ''
      });

      // Create subject relationship
      await session.run(`
        MATCH (s:Schematic {id: $schematicId})
        MATCH (t:Term {abbreviation: $subject})
        CREATE (s)-[:HAS_SUBJECT]->(t)
      `, { schematicId: schematic.id, subject: schematic.subject });

      // Create term relationships
      for (const term of schematic.terms) {
        await session.run(`
          MATCH (s:Schematic {id: $schematicId})
          MATCH (t:Term {id: $termId})
          CREATE (s)-[:CONTAINS {isSubject: $isSubject, prefix: $prefix}]->(t)
        `, {
          schematicId: schematic.id,
          termId: term.termId,
          isSubject: term.isSubject || false,
          prefix: term.prefix || null
        });
      }

      // Create relationships between terms
      for (const rel of schematic.relationships) {
        // Note: This would require the terms to be nodes in the schematic context
        // For now, we just log it
        console.log(`  Relationship: ${rel.from} -> ${rel.to} (${rel.type})`);
      }
    }

    console.log('Creating volume nodes...');
    await session.run(`
      CREATE (v1:Volume {number: 1, title: "Foundations"})
      CREATE (v2:Volume {number: 2, title: "Critique"})
      CREATE (v3:Volume {number: 3, title: "Synthesis"})
    `);

    console.log('Linking to volumes...');
    await session.run(`
      MATCH (t:Term), (v:Volume)
      WHERE t.volume = v.number
      CREATE (t)-[:APPEARS_IN]->(v)
    `);
    await session.run(`
      MATCH (s:Schematic), (v:Volume)
      WHERE s.volume = v.number
      CREATE (s)-[:IN_VOLUME]->(v)
    `);

    console.log('Import complete!');

    // Test query
    const result = await session.run(`
      MATCH (s:Schematic)-[:HAS_SUBJECT]->(t:Term)
      RETURN s.title as schematic, t.abbreviation as subject
      LIMIT 5
    `);
    console.log('Sample data:', result.records.map(r => r.toObject()));

  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await session.close();
    await driver.close();
  }
}

importData();
