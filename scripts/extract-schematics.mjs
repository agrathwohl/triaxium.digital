import fs from 'fs';
import path from 'path';

// Read memory file
const memoryContent = fs.readFileSync('./memory/2026-04-12.md', 'utf8');

// Parse schematics from markdown
const schematics = [];

// Match schematic entries
const schematicPattern = /\*\*([^*]+)\*\*.*?```\n([\s\S]*?)```/g;

// Extract from the Evening Session section
const lines = memoryContent.split('\n');
let currentSchematic = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Match Volume/Section/Page patterns
  const volumeMatch = line.match(/Volume (\d)/);
  const sectionMatch = line.match(/(WM|SD\(SY\)|\(AF\)D|BK\(NM\)|CS|ALT\(FT\)|EVOL)[-\d]*/);
  const pageMatch = line.match(/page (\d+)/i);
  
  // Match schematic structure indicators
  if (line.includes('──') || line.includes('├') || line.includes('└')) {
    // This is a schematic diagram
    const nextLines = lines.slice(i, i + 30);
    const schematicText = nextLines.join('\n');
    
    // Extract terms
    const termMatches = schematicText.match(/[A-Z][A-Z\-\.\d]*/g);
    if (termMatches && termMatches.length > 2) {
      const uniqueTerms = [...new Set(termMatches)];
      
      // Find subject (usually first with arrow or emphasis)
      const subject = uniqueTerms[0];
      
      schematics.push({
        id: `schematic-${schematics.length + 1}`,
        volume: volumeMatch ? parseInt(volumeMatch[1]) : 1,
        section: sectionMatch ? sectionMatch[1] : 'UNKNOWN',
        page: pageMatch ? parseInt(pageMatch[1]) : 0,
        subject: subject,
        title: `Schematic from ${sectionMatch ? sectionMatch[1] : 'Unknown'}`,
        type: detectType(schematicText),
        description: 'Extracted from memory documentation',
        terms: uniqueTerms.map(t => ({ termId: t.toLowerCase().replace(/\./g, '-') })),
        relationships: extractRelationships(schematicText, uniqueTerms)
      });
    }
  }
}

function detectType(text) {
  if (text.includes('├') || text.includes('└')) return 'tree';
  if (text.includes('──') && text.includes('│')) return 'crossing';
  return 'network';
}

function extractRelationships(text, terms) {
  const relationships = [];
  // Simple heuristic: adjacent terms in diagram are related
  for (let i = 0; i < terms.length - 1; i++) {
    relationships.push({
      from: terms[i].toLowerCase().replace(/\./g, '-'),
      to: terms[i + 1].toLowerCase().replace(/\./g, '-'),
      type: 'solid'
    });
  }
  return relationships;
}

console.log(`Extracted ${schematics.length} schematics`);

// Create output directory
const outputDir = './data/schematics';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write individual JSON files
schematics.forEach((schematic, index) => {
  const filename = `${schematic.id}.json`;
  fs.writeFileSync(
    path.join(outputDir, filename),
    JSON.stringify(schematic, null, 2)
  );
});

console.log(`Wrote ${schematics.length} JSON files to ${outputDir}`);
