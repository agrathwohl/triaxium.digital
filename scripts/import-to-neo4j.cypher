// Neo4j Import Script for Tri-Axium Schematics
// Run with: cat import-to-ne4j.cypher | cypher-shell -u neo4j -p password

// Clear existing data
MATCH (n) DETACH DELETE n;

// Create constraints
CREATE CONSTRAINT term_abbreviation IF NOT EXISTS
FOR (t:Term) REQUIRE t.abbreviation IS UNIQUE;

CREATE CONSTRAINT schematic_id IF NOT EXISTS
FOR (s:Schematic) REQUIRE s.id IS UNIQUE;

// Load terms from CSV
LOAD CSV WITH HEADERS FROM 'file:///terms.csv' AS row
CREATE (t:Term {
  id: row.id,
  abbreviation: row.abbreviation,
  expansion: row.expansion,
  category: row.category,
  volume: toInteger(row.volume),
  definition: row.definition
});

// Load schematics from CSV
LOAD CSV WITH HEADERS FROM 'file:///schematics.csv' AS row
CREATE (s:Schematic {
  id: row.id,
  volume: toInteger(row.volume),
  section: row.section,
  page: toInteger(row.page),
  subject: row.subject,
  title: row.title,
  type: row.type,
  description: row.description
});

// Create relationships: Schematic -> Subject Term
MATCH (s:Schematic), (t:Term)
WHERE s.subject = t.abbreviation
CREATE (s)-[:HAS_SUBJECT]->(t);

// Create term-to-term relationships based on co-occurrence in schematics
// This would require additional CSV data for term links

// Create volume nodes for organization
CREATE (v1:Volume {number: 1, title: "Foundations"});
CREATE (v2:Volume {number: 2, title: "Critique"});
CREATE (v3:Volume {number: 3, title: "Synthesis"});

// Link terms to volumes
MATCH (t:Term), (v:Volume)
WHERE t.volume = v.number
CREATE (t)-[:APPEARS_IN]->(v);

// Link schematics to volumes
MATCH (s:Schematic), (v:Volume)
WHERE s.volume = v.number
CREATE (s)-[:IN_VOLUME]->(v);

// Create category nodes
CREATE (cat_affinity:Category {name: "Affinity", code: "AF"});
CREATE (cat_information:Category {name: "Information", code: "INFO"});
CREATE (cat_vibrational:Category {name: "Vibrational", code: "VT"});
CREATE (cat_reality:Category {name: "Reality", code: "RT"});
CREATE (cat_composite:Category {name: "Composite", code: "C"});
CREATE (cat_transformation:Category {name: "Transformation", code: "TR"});

// Link terms to categories
MATCH (t:Term), (c:Category)
WHERE t.category = toLower(c.code)
CREATE (t)-[:BELONGS_TO]->(c);

// Query examples:
// Find all schematics with AFI
// MATCH (t:Term {abbreviation: "AFI"})<-[:CONTAINS]-(s:Schematic) RETURN s

// Find shortest path between two terms
// MATCH path = shortestPath((a:Term {abbreviation: "VT-DY"})-[:RELATES_TO*]-(b:Term {abbreviation: "TR"})) RETURN path

// Get all terms in Volume 3
// MATCH (t:Term)-[:APPEARS_IN]->(v:Volume {number: 3}) RETURN t ORDER BY t.abbreviation
