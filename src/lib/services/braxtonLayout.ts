import { Schematic } from '@/types';
import { terms } from '@/data/schematics-full';

export interface LayoutLine { x1: number; y1: number; x2: number; y2: number; dotted: boolean }
export interface LayoutLabel {
  id: string;
  text: string;
  x: number;
  y: number;
  lx: number;
  ly: number;
  anchor: 'start' | 'middle' | 'end';
  dotted: boolean;
  isSubject: boolean;
  box: { x: number; y: number; w: number; h: number };
}
export interface BraxtonLayout { lines: LayoutLine[]; labels: LayoutLabel[]; width: number; height: number }

// Prefix wording from Braxton's legend (Tri-Axium Writings vol. 1, CODE section).
export const PREFIX_LEGEND: Record<string, string> = {
  r: '(R) the reality of',
  R: '(R) the reality of',
  c: '(C) the concept of',
  p: '(P) point of idea completion',
  'p-at': '(P-AT) point of activation',
  po: '(PO) point of',
  'p-in': '(P-IN) its position in',
  d: '(D) the dynamics of',
  ct: '(CT) the criterion of',
  l: '(L) level',
  pfc: '(PFC) point for future calibration',
};

export const FONT_SIZE = 13;
const CHAR_W = FONT_SIZE * 0.6;
const ROW = 22;
const SHEAR = 0.2;
const ARROW_ROOM = 40;
const PAD = 24;

const glossary = new Map(terms.map((t) => [t.id, t]));

export function drawnLabel(s: Schematic, termId: string): string {
  const m = termId.match(/^(.*)-([2-9])$/);
  const repeated = m && s.terms.some((t) => t.termId === m[1]);
  const id = repeated ? m![1] : termId;
  let text = (glossary.get(id)?.abbreviation ?? id).toLowerCase().replace(/-/g, '.').replace(/\s+/g, '');
  if (!text.endsWith('.')) text += '.';
  const prefix = s.terms.find((t) => t.termId === termId)?.prefix;
  return (prefix ? `(${prefix})` : '') + text;
}

export interface ChartNode {
  id: string;
  dotted: boolean;
  kids: ChartNode[];
}

interface Node extends ChartNode {
  kids: Node[];
  starts: number[];
  len: number;
  leftExtent: number;
  rightExtent: number;
  width: number;
  thickness: number;
  side: 1 | -1;
  junctionX: number;
}

const codeOf = (part: string) =>
  part.trim().replace(/^\([^)]*\)/, '').toLowerCase().replace(/\s+/g, '').replace(/\./g, '-').replace(/^-+|-+$/g, '');

export function chartTree(s: Schematic): { root: Node; partner: Node | null } {
  const ids = new Set(s.terms.map((t) => t.termId));
  const adj = new Map<string, { to: string; dotted: boolean; fwd: boolean }[]>([...ids].map((i) => [i, []]));
  for (const r of s.relationships) {
    const a = r.from.toLowerCase(), b = r.to.toLowerCase();
    if (!ids.has(a) || !ids.has(b)) continue;
    adj.get(a)!.push({ to: b, dotted: r.type === 'dashed', fwd: true });
    adj.get(b)!.push({ to: a, dotted: r.type === 'dashed', fwd: false });
  }
  adj.forEach((l) => l.sort((x, y) => Number(y.fwd) - Number(x.fwd)));

  const mk = (id: string, dotted: boolean): Node => ({ id, dotted, kids: [], starts: [], len: 0, leftExtent: 0, rightExtent: 0, width: 0, thickness: 0, side: -1, junctionX: 0 });
  const root = mk(s.subject, false);
  const seen = new Set([s.subject]);
  const queue = [root];
  while (queue.length) {
    const n = queue.shift()!;
    for (const e of adj.get(n.id) ?? []) {
      if (seen.has(e.to)) continue;
      seen.add(e.to);
      const k = mk(e.to, e.dotted);
      n.kids.push(k);
      queue.push(k);
    }
  }
  const titlePartner = codeOf(s.title.split(/-{3,}/)[1] ?? '');
  return { root, partner: root.kids.find((k) => k.id === titlePartner) ?? root.kids[0] ?? null };
}

/**
 * Lay out a chart in Braxton's drawing grammar (vol. 1 pp. 11–14): the main line runs from the
 * subject to the partner; every other line starts on the line of the term it comes from and ends
 * at a dot with its label. Lines from the main line alternate above and below it; lines from those
 * alternate horizontal and vertical. Labels keep their size; a large chart is large.
 */
export function layoutBraxtonianSchematic(s: Schematic): BraxtonLayout {
  const { root, partner: P } = chartTree(s);

  const w = (n: Node) => drawnLabel(s, n.id).length * CHAR_W;
  // Labels stay flat while the shear lifts the lines to their right, so a label that sits above
  // other lines needs SHEAR × its width of extra room.
  const measureV = (n: Node, side: 1 | -1) => {
    let along = ROW * 0.9, prevW = 0;
    n.kids.forEach((k, i) => {
      measureH(k, side);
      along += side < 0 ? SHEAR * w(k) : i ? SHEAR * prevW : 0;
      n.starts.push(along);
      along += Math.max(ROW, k.thickness + ROW / 2) + 6;
      prevW = w(k);
    });
    n.len = Math.max(along + ROW * 0.3, 2 * ROW);
    n.leftExtent = w(n) / 2 + 6;
    n.rightExtent = Math.max(w(n) / 2 + 6, ...n.kids.map((k) => k.width + 4));
  };
  const measureH = (n: Node, side: 1 | -1) => {
    let along = 18;
    for (const k of n.kids) { measureV(k, side); along += k.leftExtent; n.starts.push(along); along += k.rightExtent + 10; }
    n.len = Math.max(along, 36);
    n.width = Math.max(n.len + 8 + w(n), ...n.kids.map((k, i) => n.starts[i] + k.rightExtent));
    n.thickness = Math.max(ROW * 0.7, ...n.kids.map((k) => k.len + ROW));
  };

  type Dot = { n: Node; x: number; y: number; pos: 'above' | 'below' | 'right' | 'subject' };
  const segs: [number, number, number, number, boolean][] = [];
  const dots: Dot[] = [];
  const placeV = (n: Node, x: number, y: number, side: 1 | -1) => {
    const ey = y + side * n.len;
    segs.push([x, y, x, ey, n.dotted]);
    dots.push({ n, x, y: ey, pos: side < 0 ? 'above' : 'below' });
    n.kids.forEach((k, i) => placeH(k, x, y + side * n.starts[i], side, x + k.len, y + side * n.starts[i]));
  };
  const placeH = (n: Node, x: number, y: number, side: 1 | -1, ex: number, ey: number) => {
    segs.push([x, y, ex, ey, n.dotted]);
    dots.push({ n, x: ex, y: ey, pos: 'right' });
    n.kids.forEach((k, i) => { const t = n.starts[i] / n.len; placeV(k, x + (ex - x) * t, y + (ey - y) * t, side); });
  };

  const branches = root.kids.filter((k) => k !== P);
  branches.forEach((k, i) => { k.side = i % 2 ? 1 : -1; measureV(k, k.side); });
  const cursor = { '-1': 26, '1': 26 };
  for (const k of branches) { k.junctionX = cursor[k.side] + k.leftExtent; cursor[k.side] = k.junctionX + k.rightExtent + 16; }
  const L = Math.max(cursor['-1'], cursor['1'], 140) + 20 + (P ? w(P) / 2 : 0);
  dots.push({ n: root, x: 0, y: 0, pos: 'subject' });
  if (P) { segs.push([0, 0, L, 0, P.dotted]); dots.push({ n: P, x: L, y: 0, pos: 'above' }); }
  branches.forEach((k) => placeV(k, k.junctionX, 0, k.side));
  if (P) {
    let off = ROW * 0.9;
    for (const k of P.kids) {
      measureH(k, 1);
      placeH(k, L, 0, 1, L + Math.max(k.len, 50), off);
      off += Math.max(ROW, k.thickness + ROW / 2) + 8;
    }
  }

  const tf = (x: number, y: number): [number, number] => [x, y - SHEAR * x];
  const lines = segs.map(([x1, y1, x2, y2, dotted]) => { const [a, b] = tf(x1, y1); const [c, d] = tf(x2, y2); return { x1: a, y1: b, x2: c, y2: d, dotted }; });
  const labels: LayoutLabel[] = dots.map((o) => {
    const [x, y] = tf(o.x, o.y);
    const text = drawnLabel(s, o.n.id), tw = text.length * CHAR_W;
    let lx: number, ly: number, anchor: LayoutLabel['anchor'];
    if (o.pos === 'right') { lx = x + 7; ly = y + 4.5; anchor = 'start'; }
    else if (o.pos === 'above') { lx = x; ly = y - 9; anchor = 'middle'; }
    else if (o.pos === 'below') { lx = x; ly = y + 17; anchor = 'middle'; }
    else { lx = x - 4; ly = y + 18; anchor = 'end'; }
    const x0 = anchor === 'start' ? lx : anchor === 'end' ? lx - tw : lx - tw / 2;
    return { id: o.n.id, text, x, y, lx, ly, anchor, dotted: o.n.dotted, isSubject: o.pos === 'subject', box: { x: x0 - 3, y: ly - 14, w: tw + 6, h: 19 } };
  });

  separateOverlappingLabels(labels);

  let minX = Infinity, minY = -ARROW_ROOM, maxX = -Infinity, maxY = -Infinity;
  for (const l of lines) { minX = Math.min(minX, l.x1, l.x2); maxX = Math.max(maxX, l.x1, l.x2); minY = Math.min(minY, l.y1, l.y2); maxY = Math.max(maxY, l.y1, l.y2); }
  for (const l of labels) { minX = Math.min(minX, l.box.x); maxX = Math.max(maxX, l.box.x + l.box.w); minY = Math.min(minY, l.box.y); maxY = Math.max(maxY, l.box.y + l.box.h); }
  const dx = PAD - minX, dy = PAD - minY;
  return {
    lines: lines.map((l) => ({ ...l, x1: l.x1 + dx, y1: l.y1 + dy, x2: l.x2 + dx, y2: l.y2 + dy })),
    labels: labels.map((l) => ({ ...l, x: l.x + dx, y: l.y + dy, lx: l.lx + dx, ly: l.ly + dy, box: { ...l.box, x: l.box.x + dx, y: l.box.y + dy } })),
    width: Math.ceil(maxX - minX + PAD * 2),
    height: Math.ceil(maxY - minY + PAD * 2),
  };
}

function separateOverlappingLabels(labels: LayoutLabel[]) {
  for (let pass = 0; pass < 60; pass++) {
    let moved = false;
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        const a = labels[i].box, b = labels[j].box;
        const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
        const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
        if (ox <= 1 || oy <= 2) continue;
        const half = (b.y + b.h / 2 >= a.y + a.h / 2 ? 1 : -1) * (oy + 1) / 2;
        labels[i].ly -= half;
        a.y -= half;
        labels[j].ly += half;
        b.y += half;
        moved = true;
      }
    }
    if (!moved) return;
  }
}
