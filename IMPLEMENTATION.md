# Tri-Axium Digital — Implementation Guide

## What Was Built

### 1. Full Dataset (schematics-full.ts)
- **80+ terms** from CODE section (Volumes 1-3)
- **8 representative schematics** from all three volumes
- Full definitions, categories, and relationships

### 2. Data Pipeline
```
src/data/schematics-full.ts     → TypeScript dataset (80+ terms)
data/terms.csv                  → CSV for Neo4j import
data/schematics.csv             → CSV for Neo4j import
scripts/import.ts               → TypeScript Neo4j importer
scripts/import-to-neo4j.cypher  → Cypher import script
```

### 3. API Routes (No Auth)
```
GET  /api/schematics          → List all (with filters)
POST /api/schematics          → Create new
GET  /api/schematics/[id]     → Get specific
PUT  /api/schematics/[id]     → Update
DELETE /api/schematics/[id]   → Delete
GET  /api/terms               → List terms
```

### 4. Docker Infrastructure
```
Dockerfile              → Node.js 20 + Next.js build
docker-compose.yml      → App + Neo4j services
Makefile                → Convenient commands
.env.local.example      → Environment template
```

## Quick Start

### Option A: JSON Data Only (No Database)
```bash
cd taw.io
npm install
npm run dev
# Open http://localhost:3000
# Uses schematics-full.ts directly
```

### Option B: With Neo4j (Full Graph)
```bash
# 1. Start Neo4j
docker-compose up -d neo4j

# 2. Wait for Neo4j to start (check http://localhost:7474)

# 3. Import data
npm install
npx ts-node scripts/import.ts

# 4. Start app
npm run dev
```

### Option C: Full Docker Stack
```bash
make up          # Start everything
make import      # Import data to Neo4j
make dev         # Start dev server
```

## Neo4j Browser

Once Neo4j is running:
- URL: http://localhost:7474
- Username: neo4j
- Password: braxton

Sample queries:
```cypher
// Find all schematics
MATCH (s:Schematic) RETURN s LIMIT 10

// Find terms by category
MATCH (t:Term {category: "affinity"}) RETURN t

// Get schematics with their subjects
MATCH (s:Schematic)-[:HAS_SUBJECT]->(t:Term)
RETURN s.title, t.abbreviation

// Shortest path between terms
MATCH path = shortestPath(
  (a:Term {abbreviation: "VT-DY"})-[:RELATES_TO*]-(b:Term {abbreviation: "TR"})
)
RETURN path
```

## Extending the Dataset

To add the remaining schematics from the 2026-04-12 documentation:

1. **Edit** `src/data/schematics-full.ts`
2. **Add entries** to the `schematics` array following the pattern
3. **Include**: id, volume, section, page, subject, title, type, description, terms[], relationships[]

Example entry:
```typescript
{
  id: 'v3-altft20',
  volume: 3,
  section: 'ALT(FT)||-20',
  page: 126,
  subject: 'BSCF',
  title: 'BSCF.------EXT.F.------INFO.DY.',
  type: 'crossing',
  description: 'Alternative functionalism synthesis',
  terms: [
    { termId: 'bscf', x: 100, y: 80, isSubject: true },
    // ... more terms
  ],
  relationships: [
    { from: 'bscf', to: 'ext-f', type: 'thick' },
    // ... more relationships
  ],
}
```

## LLM Integration (New!)

### LLM-Powered Analysis
- **Component**: `LLMAnalyzer` — Submit URLs or text for Braxtonian analysis
- **API**: `POST /api/analyze` — Sends to Anthropic Claude
- **Service**: `lib/services/anthropic.ts` — Braxtonian system prompt
- **Features**:
  - URL fetching + text extraction (cheerio)
  - Direct text analysis
  - JSON schematic generation
  - Volume alignment detection (1/2/3)
  - Insight extraction

### Environment Variables
```
ANTHROPIC_API_KEY=sk-ant-api03-...
ANTHROPIC_MODEL=claude-3-opus-20240229
```

### Usage
1. Go to `/llm-analysis` page
2. Submit news article URL or paste text
3. Claude analyzes through Tri-Axium framework
4. Generates schematic with subject, context, involved terms
5. View Braxtonian insights (spectacle-diversion, affinity dynamics, etc.)

### Example Output
```json
{
  "subject": "SPT-DYM",
  "title": "News Article as Spectacle-Diversion",
  "type": "crossing",
  "volume": 2,
  "analysis": "This article functions as spectacle...",
  "insights": [
    "High spectacle-dynamics",
    "Low affinity-insight",
    "Time-lag definitions present"
  ],
  "terms": [...],
  "relationships": [...]
}
```

## Next Steps

1. **Load remaining schematics** from memory/2026-04-12.md
2. **Add more term definitions** from Volume 1 GLOSSARY (pages 489-530)
3. **Fine-tune Neo4j** queries for performance
4. **Add D3.js interactions** (drag, zoom, click)
5. **Implement Workspace** drag-and-drop schematic builder

## Architecture Decisions

- **No Auth**: As requested, no authentication layer
- **Static + Dynamic**: JSON files for dev, Neo4j for production
- **API Routes**: RESTful endpoints ready for frontend consumption
- **Docker**: One-command startup for the full stack

---

Ready for `docker cp` or `git push`.
