import Anthropic from '@anthropic-ai/sdk';
import { Schematic } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com',
});

// Braxtonian system prompt
const BRAXTONIAN_SYSTEM_PROMPT = `You are a Braxtonian analyst. You analyze texts through the lens of the Tri-Axium Writings by Anthony Braxton.

CORE CONCEPTS:
- Affinity Dynamics: Vibrational nature and sensibility
- Source Transfer: How knowledge moves between continuums
- Spectacle-Diversion: Manufactured illusion vs actual change
- Aspect-Essence: Focusing on one part as if it's the whole
- Multi-perspective Inquiry: Viewing from 6+ reading levels
- Vibrational Science: Including spiritual universe particulars
- Composite Aesthetic: Music-dance-masks-ceremony inseparability
- Transformation: Cosmic junction giving new options

NOTATION SYSTEM:
Use abbreviated terms from the Tri-Axium CODE:
- VT-DY: vibrational dynamics
- AFI: affinity insight
- RT-ALGN: reality alignment
- PROG-CONT: progressional continuance
- SPT-DYM: spectacle dynamics
- INFO-INTG: information integration
- TR: transformation
- ALT-FT: alternative functionalism

SCHEMATIC FORMAT:
Output as JSON:
{
  "subject": "main concept (e.g., SPT-DYM)",
  "title": "descriptive title",
  "type": "tree|network|crossing|angled-tree",
  "analysis": "Braxtonian interpretation",
  "terms": [
    {"term": "VT-DY", "role": "subject|context|involved", "prefix": "(c)|(r)|[R]"},
    ...
  ],
  "relationships": [
    {"from": "term1", "to": "term2", "type": "solid|dashed|thick"}
  ],
  "insights": ["key insight 1", "key insight 2"],
  "volume_alignment": "Which volume's perspective (1=foundations, 2=critique, 3=synthesis)"
}

ANALYZE FOR:
1. What is the vibrational reality being expressed?
2. What affinities are being compressed or expressed?
3. Is this spectacle-diversion or source-transfer?
4. What aspects are being focused on vs the essence?
5. What transformation (if any) is occurring?
6. How does this relate to composite humanity?`;

export async function analyzeText(text: string): Promise<Partial<Schematic> & { analysis: string; insights: string[] }> {
  const message = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229',
    max_tokens: 2000,
    system: BRAXTONIAN_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Analyze this text through the Braxtonian framework and output a JSON schematic:

TEXT TO ANALYZE:
---
${text.substring(0, 8000)}
---

Provide your analysis as JSON.`
      }
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Anthropic');
  }

  // Parse JSON from response
  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse JSON from LLM response');
  }

  const result = JSON.parse(jsonMatch[0]);
  
  return {
    id: `llm-${Date.now()}`,
    volume: result.volume_alignment === '2' ? 2 : result.volume_alignment === '3' ? 3 : 1,
    section: 'LLM-ANALYSIS',
    page: 0,
    subject: result.subject,
    title: result.title,
    type: result.type || 'tree',
    description: result.analysis,
    analysis: result.analysis,
    insights: result.insights || [],
    terms: [], // Would be populated from parsing
    relationships: [],
  };
}

export async function generateSchematicFromAnalysis(
  subject: string,
  context: string,
  terms: string[]
): Promise<string> {
  const message = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229',
    max_tokens: 1000,
    system: `You generate Braxtonian integration schematics. Output ASCII art diagrams using:
- Branches: ├──, └──, │
- Arrows: ←, →, ↑, ↓
- Lines: ───, ─ ─ ─ (dashed), === (thick)

Format:
SUBJECT------CONTEXT
├── BRANCH 1
│   └── SUB-BRANCH
└── BRANCH 2`,
    messages: [
      {
        role: 'user',
        content: `Generate a Braxtonian schematic for:
Subject: ${subject}
Context: ${context}
Key Terms: ${terms.join(', ')}

Output the ASCII schematic:`
      }
    ],
  });

  const content = message.content[0];
  return content.type === 'text' ? content.text : '';
}
