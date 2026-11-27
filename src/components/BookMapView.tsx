'use client';

import { Schematic } from '@/types';
import { chapters, chapterEnd, chapterOf, lastPage } from '@/data/chapters';
import { useTip, VizTip } from '@/components/VizTip';

export const VOLUME_COLOR = { 1: '#338ced', 2: '#e76624', 3: '#00a888' } as const;
const QA_BAND = '#241a1c';
const BANDS = ['#0d1117', '#131a24'];

export default function BookMapView({ schematics, onOpenChart }: { schematics: Schematic[]; onOpenChart: (s: Schematic) => void }) {
  const { tip, bind } = useTip();
  const W = 1080, X0 = 70, X1 = W - 10, ROW = 80;
  const byPage = new Map<string, Schematic[]>();
  for (const s of schematics) byPage.set(`${s.volume}|${s.page}`, [...(byPage.get(`${s.volume}|${s.page}`) ?? []), s]);
  const inChapter = (v: 1 | 2 | 3, prefix: string) => schematics.filter((s) => s.volume === v && chapterOf(v, s.page).prefix === prefix);

  return (
    <div className="p-3 sm:p-6 space-y-5">
      <div>
        <h2 className="text-sm font-bold text-bx-white tracking-widest">BOOK</h2>
        <p className="text-xs text-bx-gray-400 mt-1 max-w-3xl leading-relaxed">
          {`Where the ${schematics.length} charts are in the three volumes. Each tick is a page with charts; a taller tick has two or three. ` +
            'The bands are the chapters from each volume’s Contents page; the red bands are the Questions & Answers chapters, which have no charts. ' +
            'Select a tick to open its chart.'}
        </p>
      </div>

      <div className="bg-bx-black border border-bx-trace overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${ROW * 3 + 8}`} className="w-full h-auto block min-w-[760px]" role="img" aria-label="Pages with charts in the three volumes">
          {([1, 2, 3] as const).map((v) => {
            const y = (v - 1) * ROW + 8, last = lastPage[v];
            const x = (p: number) => X0 + ((p - 1) / last) * (X1 - X0);
            return (
              <g key={v}>
                <text x={0} y={y + 42} fontSize={13} fontWeight="bold" fill="#c8cdd5" fontFamily="'IBM Plex Mono', monospace">Vol. {v}</text>
                {chapters[v].map((c, i) => {
                  const end = chapterEnd(v, c) + 1, bw = x(end) - x(c.start), n = inChapter(v, c.prefix).length;
                  return (
                    <g key={c.prefix} {...bind(<><div className="text-bx-white font-bold">{c.prefix}</div><div>{c.name}</div><div>pp. {c.start}–{end - 1} · {n} chart{n === 1 ? '' : 's'}</div></>)}>
                      <rect x={x(c.start)} y={y + 16} width={bw} height={44} fill={c.level === 'L3' ? QA_BAND : BANDS[i % 2]} />
                      {bw > c.prefix.length * 6.6 + 4 && (
                        <text x={x(c.start) + bw / 2} y={y + 11} textAnchor="middle" fontSize={10.5} fill="#8090a0" fontFamily="'IBM Plex Mono', monospace">{c.prefix}</text>
                      )}
                    </g>
                  );
                })}
                {[...byPage.entries()].filter(([k]) => k.startsWith(`${v}|`)).map(([k, list]) => {
                  const p = list[0].page, px = x(p), h = 12 + 10 * (list.length - 1);
                  return (
                    <g key={k} tabIndex={0} role="button" aria-label={`Volume ${v} page ${p}`} className="cursor-pointer outline-none group"
                      onClick={() => onOpenChart(list[0])}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenChart(list[0]); } }}
                      {...bind(<><div className="text-bx-white font-bold">Vol. {v} p. {p}</div>{list.map((s) => <div key={s.id}>{s.id} · {s.title}</div>)}</>)}>
                      <rect x={px - 2.5} y={y + 16} width={5} height={44} fill="transparent" />
                      <line x1={px} x2={px} y1={y + 60} y2={y + 60 - h} stroke={VOLUME_COLOR[v]} strokeWidth={1.6} className="group-hover:[stroke-width:4] group-focus:[stroke-width:4]" />
                    </g>
                  );
                })}
                <line x1={X0} x2={X1} y1={y + 60} y2={y + 60} stroke="#414d5a" />
                {[100, 200, 300, 400, 500].filter((t) => t <= last).map((t) => (
                  <text key={t} x={x(t)} y={y + 73} textAnchor="middle" fontSize={10} fill="#8090a0" fontFamily="'IBM Plex Mono', monospace">{t}</text>
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {([1, 2, 3] as const).map((v) => (
          <div key={v} className="bg-bx-surface border border-bx-trace p-3">
            <div className="text-xs font-bold tracking-widest mb-2" style={{ color: VOLUME_COLOR[v] }}>VOLUME {v}</div>
            <ul className="space-y-1">
              {chapters[v].filter((c) => c.level !== 'front' && c.level !== 'back').map((c) => {
                const list = inChapter(v, c.prefix);
                return (
                  <li key={c.prefix}>
                    <button disabled={!list.length} onClick={() => onOpenChart(list[0])}
                      className="w-full text-left flex items-baseline justify-between gap-2 text-xs text-bx-gray-300 hover:text-bx-white disabled:text-bx-gray-500 disabled:cursor-default">
                      <span><span className="text-bx-gray-400">{c.prefix}</span> {c.name}</span>
                      <span className="tabular-nums text-bx-gray-400">{list.length}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <VizTip tip={tip} />
    </div>
  );
}
