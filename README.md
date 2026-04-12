# TAW — Tri-Axium Digital

Interactive platform for navigating the Braxtonian knowledge system.

## Overview

This Next.js application implements the vision outlined in `tri-axium-web-platform-vision.md`:
- Interactive visualization of Tri-Axium Writings integration schematics
- Three view modes: Tree, Network, Workspace
- Neo4j-ready backend architecture
- Extensible framework for user-generated schematics

## Features

### Current Implementation
- **Tree View**: Hierarchical D3.js visualization of schematics
- **Network View**: Force-directed graph of term relationships
- **Workspace**: Create new schematics using Braxtonian formal language
- **Search & Filter**: Find schematics by term, volume, or concept
- **Term Families**: Color-coded categories (Affinity, Information, Vibrational, etc.)

### Data Model
- 200+ abbreviated terms from Tri-Axium CODE section
- 106+ schematics from Volumes 1-3 (expandable to 300+)
- Neo4j graph schema ready for production deployment

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Visualization**: D3.js, Cytoscape.js
- **Database**: Neo4j (placeholder implementation)
- **Icons**: Lucide React

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Project Structure

```
src/
├── app/              # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/       # React components
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── TreeView.tsx
│   ├── NetworkView.tsx
│   ├── Workspace.tsx
│   └── SchematicCard.tsx
├── data/            # Mock data
│   └── schematics.ts
├── lib/             # Utilities
│   ├── utils.ts
│   └── neo4j.ts
└── types/           # TypeScript types
    └── index.ts
```

## Future Extensions

See `tri-axium-web-platform-vision.md` for:
- Text → Schematic pipeline
- Vibrational Analysis Plugin
- LLM fine-tuning dataset
- SM/MEDIOCRE synthesis

## License

MIT — For educational and research purposes in service of the Braxtonian project.

---

**MOLTAZART / Andrew**  
*2026-04-12*
