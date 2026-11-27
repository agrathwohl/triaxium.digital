'use client';

import { Schematic } from '@/types';
import { chapters, chapterOf } from '@/data/chapters';
import { CorpusIndex, codeName, meaning } from '@/lib/corpus';
import { useTip, VizTip } from '@/components/VizTip';
import { VOLUME_COLOR } from '@/components/BookMapView';

const RAMP = ['#131a24', '#16324f', '#1757ac', '#2370cd', '#519ced', '#b6d5f8'];
const BINS = [0, 0.1, 0.2, 0.35, 0.5];
const BIN_LABELS = ['0%', '1–10%', '10–20%', '20–35%', '35–50%', '50% +'];
const binOf = (share: number) => (share === 0 ? 0 : BINS.filter((b) => share > b).length);

interface CodesViewProps { schematics: Schematic[]; index: CorpusIndex; onCode: (code: string) => void }

export default function CodesView({ schematics, index, onCode }: CodesViewProps) {
  const { tip, bind } = useTip();
  const ranked = [...index.codes.values()].sort((a, b) => b.charts.length - a.charts.length);
  const top = ranked.slice(0, 20), rows = ranked.slice(0, 24);
  const max = top[0]?.charts.length ?? 1;
  const cols = ([1, 2, 3] as const).flatMap((v) =>
    chapters[v].map((c) => ({ v, c, list: schematics.filter((s) => s.volume === v && chapterOf(v, s.page).prefix === c.prefix) }))
      .filter((col) => col.list.length > 1));

  const BW = 680, LX = 300, BAR = BW - LX - 44, RH = 22;
  const CW = 26, CH = 21, HX = 92, HY = 112;

  return (
    <div className="p-3 sm:p-6 space-y-6">
      <div>
        <h2 className="text-sm font-bold text-bx-white tracking-widest">CODES</h2>
        <p className="text-xs text-bx-gray-400 mt-1 max-w-3xl leading-relaxed">
          {index.codes.size} codes appear in the charts. Select a code to open it in the Atlas.
        </p>
      </div>

      <div className="bg-bx-surface border border-bx-trace p-4 max-w-3xl">
        <div className="text-xs font-bold text-bx-gray-400 tracking-widest mb-2">THE 20 MOST FREQUENT CODES, CHARTS PER VOLUME</div>
        <div className="flex flex-wrap gap-4 text-xs text-bx-gray-400 mb-2">
          {([1, 2, 3] as const).map((v) => <span key={v} className="flex items-center gap-1.5"><span className="w-3 h-3 inline-block" style={{ background: VOLUME_COLOR[v] }} />Volume {v}</span>)}
        </div>
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${BW} ${top.length * RH + 24}`} className="w-full h-auto block min-w-[560px]" role="img" aria-label="The 20 most frequent codes by charts per volume">
            {[0, 50, 100, 150].filter((t) => t <= max).map((t) => (
              <g key={t}>
                <line x1={LX + (t / max) * BAR} x2={LX + (t / max) * BAR} y1={0} y2={top.length * RH} stroke="#1f2733" />
                <text x={LX + (t / max) * BAR} y={top.length * RH + 16} textAnchor="middle" fontSize={10.5} fill="#8090a0">{t}</text>
              </g>
            ))}
            {top.map((c, i) => {
              const y = i * RH + 4;
              let x = LX;
              return (
                <g key={c.id}>
                  <text x={0} y={y + 12} fontSize={12.5} fill="#c8cdd5" fontFamily="'IBM Plex Mono', monospace" className="cursor-pointer hover:fill-white" tabIndex={0} role="button"
                    onClick={() => onCode(c.id)} onKeyDown={(e) => { if (e.key === 'Enter') onCode(c.id); }}>{codeName(c.id)}</text>
                  <text x={86} y={y + 12} fontSize={11} fill="#8090a0">{meaning(c.id).slice(0, 30)}</text>
                  {c.byVolume.map((n, j) => {
                    const w = (n / max) * BAR, x0 = x;
                    x += w;
                    return n ? <rect key={j} x={x0 + (j ? 1 : 0)} y={y + 2} width={Math.max(0, w - (j ? 2 : 1))} height={13} rx={2} fill={VOLUME_COLOR[(j + 1) as 1 | 2 | 3]}
                      {...bind(<><span className="text-bx-white font-bold">{codeName(c.id)}</span> · volume {j + 1}: {n} charts</>)} /> : null;
                  })}
                  <text x={x + 6} y={y + 12.5} fontSize={11.5} fill="#c8cdd5">{c.charts.length}</text>
                </g>
              );
            })}
          </svg>
        </div>
        <details className="mt-2 text-xs text-bx-gray-400">
          <summary className="cursor-pointer">Show as a table</summary>
          <table className="mt-2 tabular-nums">
            <thead><tr className="text-left"><th className="pr-4">Code</th><th className="pr-4">Meaning</th><th className="pr-3">Vol. 1</th><th className="pr-3">Vol. 2</th><th className="pr-3">Vol. 3</th><th>Total</th></tr></thead>
            <tbody>{top.map((c) => <tr key={c.id}><td className="pr-4 text-bx-gray-300">{codeName(c.id)}</td><td className="pr-4">{meaning(c.id)}</td>{c.byVolume.map((n, j) => <td key={j} className="pr-3">{n}</td>)}<td>{c.charts.length}</td></tr>)}</tbody>
          </table>
        </details>
      </div>

      <div className="bg-bx-surface border border-bx-trace p-4">
        <div className="text-xs font-bold text-bx-gray-400 tracking-widest mb-2">CODES ACROSS THE CHAPTERS</div>
        <p className="text-xs text-bx-gray-400 mb-2 max-w-3xl">For the 24 most frequent codes: the share of each chapter’s charts that contain the code. Columns are the chapters with two or more charts, in book order.</p>
        <div className="flex flex-wrap gap-3 text-xs text-bx-gray-400 mb-2">
          {BIN_LABELS.map((l, i) => <span key={l} className="flex items-center gap-1.5"><span className="w-3 h-3 inline-block border border-bx-trace" style={{ background: RAMP[i] }} />{l}</span>)}
        </div>
        <div className="overflow-x-auto">
          <svg width={HX + cols.length * CW + 8} height={HY + rows.length * CH + 8} role="img" aria-label="Share of each chapter's charts that contain each of the 24 most frequent codes">
            {cols.map((col, j) => {
              const x = HX + j * CW, first = j === 0 || cols[j - 1].v !== col.v;
              return (
                <g key={col.v + col.c.prefix}>
                  {first && <text x={x} y={12} fontSize={11} fontWeight="bold" fill={VOLUME_COLOR[col.v]}>Vol. {col.v}</text>}
                  {first && j > 0 && <line x1={x - 1} x2={x - 1} y1={4} y2={HY + rows.length * CH + 4} stroke="#414d5a" />}
                  <text transform={`translate(${x + CW / 2 + 4},${HY - 6}) rotate(-62)`} fontSize={10.5} fill="#8090a0" fontFamily="'IBM Plex Mono', monospace"
                    {...bind(<><span className="text-bx-white font-bold">{col.c.prefix}</span> · {col.c.name} · {col.list.length} charts</>)}>{col.c.prefix}</text>
                </g>
              );
            })}
            {rows.map((c, i) => {
              const y = HY + i * CH, inCharts = new Set(c.charts);
              return (
                <g key={c.id}>
                  <text x={0} y={y + 14} fontSize={12.5} fill="#c8cdd5" fontFamily="'IBM Plex Mono', monospace" className="cursor-pointer hover:fill-white" tabIndex={0} role="button"
                    onClick={() => onCode(c.id)} onKeyDown={(e) => { if (e.key === 'Enter') onCode(c.id); }}>{codeName(c.id)}</text>
                  {cols.map((col, j) => {
                    const n = col.list.filter((s) => inCharts.has(s)).length, share = n / col.list.length;
                    return <rect key={j} x={HX + j * CW + 1} y={y + 1} width={CW - 2} height={CH - 2} rx={2} fill={RAMP[binOf(share)]} className="cursor-pointer" onClick={() => onCode(c.id)}
                      {...bind(<><span className="text-bx-white font-bold">{codeName(c.id)}</span> in {col.c.prefix}: {n} of {col.list.length} charts ({Math.round(share * 100)}%)</>)} />;
                  })}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      <VizTip tip={tip} />
    </div>
  );
}
