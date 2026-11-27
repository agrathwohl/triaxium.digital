import { Schematic } from '@/types';
import { terms } from '@/data/schematics-full';
import { chartTree, ChartNode } from '@/lib/services/braxtonLayout';

const glossary = new Map(terms.map((t) => [t.id, t]));
export const codeName = (id: string) => glossary.get(id)?.abbreviation ?? id.toUpperCase();
export const meaning = (id: string) => glossary.get(id)?.expansion ?? '';
export const definition = (id: string) => glossary.get(id)?.definition ?? '';

export function baseCode(s: Schematic, termId: string): string {
  const m = termId.match(/^(.*)-([2-9])$/);
  return m && s.terms.some((t) => t.termId === m[1]) ? m[1] : termId;
}

export interface CodeStats { id: string; charts: Schematic[]; subject: number; partner: number; branch: number; byVolume: [number, number, number] }
export interface Link { a: string; b: string; ab: number; ba: number; charts: Schematic[] }
export interface CorpusIndex { codes: Map<string, CodeStats>; neighbours: Map<string, Link[]> }

export function buildIndex(schematics: Schematic[]): CorpusIndex {
  const codes = new Map<string, CodeStats>();
  const links = new Map<string, Link>();
  for (const s of schematics) {
    const partner = chartTree(s).partner?.id;
    const seen = new Set<string>();
    for (const t of s.terms) {
      const id = baseCode(s, t.termId);
      if (seen.has(id)) continue;
      seen.add(id);
      let c = codes.get(id);
      if (!c) codes.set(id, (c = { id, charts: [], subject: 0, partner: 0, branch: 0, byVolume: [0, 0, 0] }));
      c.charts.push(s);
      c.byVolume[s.volume - 1]++;
      if (t.termId === s.subject) c.subject++;
      else if (t.termId === partner) c.partner++;
      else c.branch++;
    }
    for (const r of s.relationships) {
      const from = baseCode(s, r.from.toLowerCase()), to = baseCode(s, r.to.toLowerCase());
      if (from === to || !seen.has(from) || !seen.has(to)) continue;
      const [a, b] = from < to ? [from, to] : [to, from];
      let l = links.get(a + '|' + b);
      if (!l) links.set(a + '|' + b, (l = { a, b, ab: 0, ba: 0, charts: [] }));
      if (from === a) l.ab++; else l.ba++;
      if (!l.charts.includes(s)) l.charts.push(s);
    }
  }
  const neighbours = new Map<string, Link[]>();
  for (const l of links.values()) for (const k of [l.a, l.b]) neighbours.set(k, [...(neighbours.get(k) ?? []), l]);
  return { codes, neighbours };
}

export function shortestPath(index: CorpusIndex, from: string, to: string): { a: string; b: string; link: Link }[] | null {
  const prev = new Map<string, { a: string; link: Link } | null>([[from, null]]);
  const queue = [from];
  while (queue.length && !prev.has(to)) {
    const x = queue.shift()!;
    for (const l of index.neighbours.get(x) ?? []) {
      const y = l.a === x ? l.b : l.a;
      if (!prev.has(y)) { prev.set(y, { a: x, link: l }); queue.push(y); }
    }
  }
  if (!prev.has(to)) return null;
  const steps = [];
  for (let x = to, p = prev.get(x); p; x = p.a, p = prev.get(x)) steps.unshift({ a: p.a, b: x, link: p.link });
  return steps;
}

const COUNT = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen'];
const PHRASE: Record<string, string> = {
  '': 'the concept of', r: 'the reality of', R: 'the reality of', c: 'the concept of', p: 'the point of idea completion of',
  'p-at': 'the point of activation of', po: 'the point of', 'p-in': 'its position in', d: 'the dynamics of', ct: 'the criterion of',
  l: 'the level of', pfc: 'the point for future calibration of',
};

// Braxton's own form for reading a chart in words (vol. 1 p. 14).
export function readInWords(s: Schematic): string {
  const { root, partner } = chartTree(s);
  const prefix = (id: string) => s.terms.find((t) => t.termId === id)?.prefix ?? '';
  const code = (id: string) => codeName(baseCode(s, id));
  const mean = (id: string) => meaning(id) || meaning(baseCode(s, id));
  const named = (n: ChartNode) => {
    const m = mean(n.id), p = prefix(n.id);
    const text = m ? `${code(n.id)}, ${p && PHRASE[p] ? PHRASE[p] + ' ' : ''}${m}` : `${code(n.id)}${p ? ` (${p.toUpperCase()})` : ''}`;
    return text + (n.dotted ? ' (dotted line)' : '');
  };
  const related = (n: ChartNode): string => (n.kids.length ? ' as related to ' + n.kids.map((k) => named(k) + related(k)).join(' and ') : '');
  const involving = (n: ChartNode) =>
    n.kids.length ? ' (' + n.kids.map((k, i) => (i ? '—or involving ' : 'involving ') + named(k) + related(k)).join('') + ')' : '';

  const opening = `${PHRASE[prefix(root.id)] ?? PHRASE['']} ${mean(root.id) || code(root.id)}`;
  let text = opening.charAt(0).toUpperCase() + opening.slice(1);
  if (partner) text += ` as this term relates to ${PHRASE[prefix(partner.id)] ?? PHRASE['']} “${mean(partner.id) || code(partner.id)}”`;
  const contexts = root.kids.filter((k) => k !== partner);
  if (contexts.length === 1) text += `—in one context: in the context of (1) ${named(contexts[0])}${involving(contexts[0])}`;
  else if (contexts.length > 1)
    text += `—in ${COUNT[contexts.length] ?? contexts.length} different contexts, those being: ` +
      contexts.map((k, i) => `${i ? 'or ' : ''}in the context of (${i + 1}) ${named(k)}${involving(k)}`).join('; ');
  if (partner?.kids.length) text += `; with ${code(partner.id)} involving ` + partner.kids.map((k) => named(k) + related(k)).join(' and ');
  return text + '.';
}
