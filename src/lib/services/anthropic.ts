import { generateObject } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { Schematic } from '@/types';

function getModel(apiKey: string) {
  const anthropic = createAnthropic({ apiKey });
  return anthropic('claude-sonnet-4-6');
}

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

ANALYZE FOR:
1. What is the vibrational reality being expressed?
2. What affinities are being compressed or expressed?
3. Is this spectacle-diversion or source-transfer?
4. What aspects are being focused on vs the essence?
5. What transformation (if any) is occurring?
6. How does this relate to composite humanity?`;

const braxtonianSchema = z.object({
  subject: z.string().describe('Main Braxtonian concept abbreviation, e.g. SPT-DYM'),
  title: z.string().describe('Descriptive title for the schematic'),
  type: z.enum(['tree', 'network', 'crossing', 'angled-tree']).describe('Schematic layout type'),
  analysis: z.string().describe('Braxtonian interpretation of the text'),
  terms: z.array(z.object({
    term: z.string().describe('Abbreviated term from TAW CODE'),
    role: z.enum(['subject', 'context', 'involved']),
    prefix: z.string().optional().describe('Prefix like (c), (r), [R], (p)'),
  })),
  relationships: z.array(z.object({
    from: z.string(),
    to: z.string(),
    type: z.enum(['solid', 'dashed', 'thick']),
  })),
  insights: z.array(z.string()).describe('Key Braxtonian insights'),
  volume_alignment: z.enum(['1', '2', '3']).describe('1=foundations, 2=critique, 3=synthesis'),
});

export async function analyzeText(text: string, apiKey: string): Promise<Partial<Schematic> & { analysis: string; insights: string[] }> {
  const { object: result } = await generateObject({
    model: getModel(apiKey),
    schema: braxtonianSchema,
    system: BRAXTONIAN_SYSTEM_PROMPT,
    prompt: `Analyze this text through the Braxtonian framework:\n\n${text.substring(0, 8000)}`,
  });

  const volNum = result.volume_alignment === '2' ? 2 : result.volume_alignment === '3' ? 3 : 1;

  return {
    id: `llm-${Date.now()}`,
    volume: volNum as 1 | 2 | 3,
    section: 'LLM-ANALYSIS',
    page: 0,
    subject: result.subject,
    title: result.title,
    type: result.type,
    description: result.analysis,
    analysis: result.analysis,
    insights: result.insights,
    terms: result.terms.map((t, i) => ({
      termId: t.term.toLowerCase().replace(/[()[\]]/g, ''),
      isSubject: t.role === 'subject',
      prefix: t.prefix as any,
    })),
    relationships: result.relationships,
  };
}

export async function generateSchematicFromAnalysis(
  subject: string,
  context: string,
  terms: string[],
  apiKey: string
): Promise<string> {
  const { object } = await generateObject({
    model: getModel(apiKey),
    schema: z.object({
      schematic: z.string().describe('ASCII art Braxtonian schematic diagram'),
    }),
    system: `You generate Braxtonian integration schematics. Output ASCII art diagrams using:
- Branches: ├──, └──, │
- Arrows: ←, →, ↑, ↓
- Lines: ───, ─ ─ ─ (dashed), === (thick)

Format:
SUBJECT------CONTEXT
├── BRANCH 1
│   └── SUB-BRANCH
└── BRANCH 2`,
    prompt: `Generate a Braxtonian schematic for:\nSubject: ${subject}\nContext: ${context}\nKey Terms: ${terms.join(', ')}`,
  });

  return object.schematic;
}
