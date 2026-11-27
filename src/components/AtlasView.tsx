'use client';

import { useMemo, useState } from 'react';
import { Schematic } from '@/types';
import { CorpusIndex, codeName, meaning, definition, shortestPath } from '@/lib/corpus';
import { useTip, VizTip } from '@/components/VizTip';

interface AtlasViewProps {
  index: CorpusIndex;
  code: string;
  onCode: (code: string) => void;
  onOpenChart: (s: Schematic) => void;
}

const OUT = '#338ced';
const IN = '#778797';
const RING = 28;

export default function AtlasView({ index, code, onCode, onOpenChart }: AtlasViewProps) {
  const { tip, bind } = useTip();
  const byName = useMemo(() => {
    const m = new Map<string, string>();
    for (const id of index.codes.keys()) { m.set(id, id); m.set(codeName(id).toLowerCase(), id); }
    return m;
  }, [index]);
  const resolve = (text: string) => byName.get(text.trim().toLowerCase().replace(/\.$/, '')) ?? byName.get(text.trim().toLowerCase().replace(/[.\s]+/g, '-').replace(/-$/, ''));
  const [query, setQuery] = useState('');
  const [from, setFrom] = useState('SG');
  const [to, setTo] = useState('JR-DY');
  const [path, setPath] = useState<ReturnType<typeof shortestPath> | 'none' | undefined>(undefined);

  const stats = index.codes.get(code);
  const links = (index.neighbours.get(code) ?? []).slice().sort((x, y) => y.charts.length - x.charts.length || (index.codes.get(y.a === code ? y.b : y.a)?.charts.length ?? 0) - (index.codes.get(x.a === code ? x.b : x.a)?.charts.length ?? 0));
  const ring = links.slice(0, RING);
  const maxW = Math.max(1, ...ring.map((l) => l.charts.length));
  const W = 660, H = 620, cx = W / 2, cy = H / 2, R = 182;
  const charts = stats ? [...stats.charts].sort((a, b) => Number(b.subject === code) - Number(a.subject === code)) : [];
  const codeList = useMemo(() => [...index.codes.values()].sort((a, b) => b.charts.length - a.charts.length), [index]);

  const go = (text: string) => { const id = resolve(text); if (id) { onCode(id); setQuery(''); } };

  return (
    <div className="p-3 sm:p-6 space-y-4">
      <div>
        <h2 className="text-sm font-bold text-bx-white tracking-widest">ATLAS</h2>
        <p className="text-xs text-bx-gray-400 mt-1 max-w-3xl leading-relaxed">
          Two codes are connected when Braxton drew a line between them in at least one chart. The ring shows the code’s most
          frequent neighbours; a thicker line is in more charts. Blue lines go out from the code, grey lines come in. Select a
          neighbour to move to it.
        </p>
      </div>

      <form className="flex flex-wrap items-center gap-2" onSubmit={(e) => { e.preventDefault(); go(query); }}>
        <label htmlFor="atlas-code" className="text-xs text-bx-gray-400">Code</label>
        <input id="atlas-code" list="atlas-codes" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={codeName(code)}
          className="bg-bx-black border border-bx-trace px-2 py-1.5 text-sm text-bx-white placeholder-bx-gray-500 focus:outline-none focus:border-bx-gray-400 w-40" />
        <button className="px-3 py-1.5 text-xs border border-bx-trace text-bx-gray-300 hover:border-bx-gray-400 hover:text-bx-white">SHOW</button>
        <datalist id="atlas-codes">
          {codeList.map((c) => <option key={c.id} value={codeName(c.id)}>{meaning(c.id)}</option>)}
        </datalist>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-4">
        <div className="bg-bx-black border border-bx-trace schematic-grid">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label={`Drawn neighbours of ${codeName(code)}`}>
            {ring.map((l, i) => {
              const other = l.a === code ? l.b : l.a, out = (l.a === code ? l.ab : l.ba) >= (l.a === code ? l.ba : l.ab);
              const a = -Math.PI / 2 + (i / ring.length) * Math.PI * 2;
              return <line key={other} x1={cx} y1={cy} x2={cx + R * Math.cos(a)} y2={cy + R * Math.sin(a)} stroke={out ? OUT : IN} strokeOpacity={0.8} strokeLinecap="round" strokeWidth={1 + 4.5 * Math.sqrt(l.charts.length / maxW)} />;
            })}
            {ring.map((l, i) => {
              const other = l.a === code ? l.b : l.a;
              const outN = l.a === code ? l.ab : l.ba, inN = l.a === code ? l.ba : l.ab;
              const a = -Math.PI / 2 + (i / ring.length) * Math.PI * 2, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
              const left = Math.cos(a) < -1e-6, deg = (a * 180) / Math.PI + (left ? 180 : 0);
              const lx = cx + (R + 13) * Math.cos(a), ly = cy + (R + 13) * Math.sin(a);
              return (
                <g key={other} tabIndex={0} role="button" className="group cursor-pointer outline-none" onClick={() => onCode(other)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCode(other); } }}
                  {...bind(<><div className="text-bx-white font-bold">{codeName(code)} — {codeName(other)}</div><div>{meaning(other)}</div><div className="mt-1">Drawn in {l.charts.length} chart{l.charts.length > 1 ? 's' : ''}: {codeName(code)} → {codeName(other)} {outN}×, {codeName(other)} → {codeName(code)} {inN}×</div></>)}>
                  <circle cx={x} cy={y} r={14} fill="transparent" />
                  <circle cx={x} cy={y} r={3 + Math.sqrt(index.codes.get(other)?.charts.length ?? 1) / 2.6} fill="#c8cdd5" />
                  <text transform={`translate(${lx},${ly}) rotate(${deg})`} dy={4} textAnchor={left ? 'end' : 'start'} fontSize={12.5}
                    fontFamily="'IBM Plex Mono', monospace" className="fill-bx-gray-300 group-hover:fill-white group-focus:fill-white">{codeName(other)}</text>
                </g>
              );
            })}
            <circle cx={cx} cy={cy} r={5 + Math.sqrt(stats?.charts.length ?? 1) / 2} fill="#e76624" />
            <text x={cx} y={cy + 30} textAnchor="middle" fontSize={15} fontWeight="bold" fontFamily="'IBM Plex Mono', monospace" fill="#ffffff" stroke="#080c12" strokeWidth={4} paintOrder="stroke">{codeName(code)}</text>
          </svg>
        </div>

        <div className="bg-bx-surface border border-bx-trace p-4 text-xs text-bx-gray-300 space-y-2 self-start">
          <div className="text-lg font-bold text-bx-white">{codeName(code)}</div>
          <div>{meaning(code) || 'No meaning in the CODE list or the text.'}</div>
          {definition(code) && <div className="text-bx-gray-400">Glossary: “{definition(code)}.”</div>}
          {stats && (
            <div>
              In <span className="text-bx-white">{stats.charts.length}</span> charts: subject in {stats.subject}, partner in {stats.partner}, branch in {stats.branch}.
              Volume 1: {stats.byVolume[0]}, volume 2: {stats.byVolume[1]}, volume 3: {stats.byVolume[2]}.
            </div>
          )}
          <div>Drawn connections to <span className="text-bx-white">{links.length}</span> codes{links.length > ring.length ? `; the ring shows the ${ring.length} most frequent` : ''}.</div>
          <div className="pt-2 text-bx-gray-400 tracking-widest font-bold">CHARTS</div>
          <div className="flex flex-wrap gap-1 max-h-56 overflow-y-auto">
            {charts.map((s) => (
              <button key={s.id} onClick={() => onOpenChart(s)} title={s.title}
                className={`px-1.5 py-0.5 border text-[11px] hover:text-bx-white ${s.subject === code ? 'border-bx-gray-300 text-bx-white' : 'border-bx-trace text-bx-gray-400'}`}>
                {s.id}
              </button>
            ))}
          </div>
          <div className="text-bx-gray-500">Light border: {codeName(code)} is the subject.</div>
        </div>
      </div>

      <div className="bg-bx-surface border border-bx-trace p-4 text-xs text-bx-gray-300">
        <form className="flex flex-wrap items-center gap-2" onSubmit={(e) => {
          e.preventDefault();
          const a = resolve(from), b = resolve(to);
          setPath(a && b ? shortestPath(index, a, b) ?? 'none' : 'none');
        }}>
          <span className="font-bold tracking-widest text-bx-gray-400">PATH</span>
          <label htmlFor="path-from">from</label>
          <input id="path-from" list="atlas-codes" value={from} onChange={(e) => setFrom(e.target.value)} className="bg-bx-black border border-bx-trace px-2 py-1 text-sm text-bx-white w-32 focus:outline-none focus:border-bx-gray-400" />
          <label htmlFor="path-to">to</label>
          <input id="path-to" list="atlas-codes" value={to} onChange={(e) => setTo(e.target.value)} className="bg-bx-black border border-bx-trace px-2 py-1 text-sm text-bx-white w-32 focus:outline-none focus:border-bx-gray-400" />
          <button className="px-3 py-1 border border-bx-trace hover:border-bx-gray-400 hover:text-bx-white">FIND</button>
        </form>
        <p className="mt-2 text-bx-gray-400">The shortest chain of drawn lines between two codes, with one chart for each step. Every code reaches every other code in 6 steps or fewer.</p>
        {path === 'none' && <p className="mt-2">Enter two codes from the list.</p>}
        {path && path !== 'none' && (
          <ol className="mt-2 space-y-1 list-decimal list-inside">
            {path.map((st) => (
              <li key={st.a + st.b}>
                <button className="text-bx-white hover:underline" onClick={() => onCode(st.a)}>{codeName(st.a)}</button> —{' '}
                <button className="text-bx-white hover:underline" onClick={() => onCode(st.b)}>{codeName(st.b)}</button>{' '}
                <span className="text-bx-gray-400">in </span>
                <button className="underline hover:text-bx-white" onClick={() => onOpenChart(st.link.charts[0])}>{st.link.charts[0].id}</button>
                <span className="text-bx-gray-400"> (vol. {st.link.charts[0].volume} p. {st.link.charts[0].page}){st.link.charts.length > 1 ? ` and ${st.link.charts.length - 1} more` : ''}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
      <VizTip tip={tip} />
    </div>
  );
}
