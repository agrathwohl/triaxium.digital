'use client';

import { useMemo, useState } from 'react';
import { Schematic } from '@/types';
import { layoutBraxtonianSchematic, PREFIX_LEGEND, FONT_SIZE } from '@/lib/services/braxtonLayout';
import { terms } from '@/data/schematics-full';

const INK = '#c8cdd5';
const ACTIVE = '#338ced';

export default function BraxtonRenderer({ schematic, onCodeClick }: { schematic: Schematic; onCodeClick?: (termId: string) => void }) {
  const layout = useMemo(() => layoutBraxtonianSchematic(schematic), [schematic]);
  const [tip, setTip] = useState<{ x: number; y: number; id: string; dotted: boolean } | null>(null);

  const term = tip ? terms.find((t) => t.id === tip.id) : undefined;
  const prefix = tip ? schematic.terms.find((t) => t.termId === tip.id)?.prefix : undefined;

  return (
    <div className="overflow-auto">
      <svg
        width={layout.width}
        height={layout.height}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        className="block mx-auto"
        role="img"
        aria-label={schematic.title}
      >
        {layout.lines.map((l, i) => (
          <line
            key={i}
            x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke={INK}
            strokeWidth={l.dotted ? 2.6 : 2}
            strokeLinecap="round"
            strokeDasharray={l.dotted ? '0.1 5.5' : undefined}
          />
        ))}
        {layout.labels.map((l) => (
          <g
            key={l.id}
            tabIndex={0}
            className="group cursor-pointer outline-none"
            onMouseMove={(e) => setTip({ x: e.clientX, y: e.clientY, id: l.id, dotted: l.dotted })}
            onMouseLeave={() => setTip(null)}
            onFocus={(e) => { const r = e.currentTarget.getBoundingClientRect(); setTip({ x: r.left, y: r.bottom, id: l.id, dotted: l.dotted }); }}
            onBlur={() => setTip(null)}
            onClick={() => onCodeClick?.(l.id)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCodeClick?.(l.id); } }}
          >
            <rect x={l.box.x} y={l.box.y} width={l.box.w} height={l.box.h} fill="transparent" />
            <circle cx={l.x} cy={l.y} r={3.2} fill={INK} />
            <text
              x={l.lx}
              y={l.ly}
              textAnchor={l.anchor}
              fontSize={FONT_SIZE}
              fontFamily="'IBM Plex Mono', monospace"
              className="fill-bx-white group-hover:fill-braxton-v1 group-focus:fill-braxton-v1"
            >
              {l.text}
            </text>
            {l.isSubject && (
              <path d={`M${l.x - 2.2},${l.y - 36} h4.4 v20 h5 l-7.2,10.5 l-7.2,-10.5 h5 z`} fill={tip?.id === l.id ? ACTIVE : INK} />
            )}
          </g>
        ))}
      </svg>

      {tip && (
        <div
          className="fixed z-50 pointer-events-none px-3 py-2 bg-bx-surface border border-bx-trace-light text-xs font-mono max-w-xs"
          style={{ left: Math.max(8, Math.min(tip.x + 12, window.innerWidth - 336)), top: tip.y + 12 }}
        >
          <div className="text-bx-white font-bold">{term?.abbreviation ?? tip.id.toUpperCase()}</div>
          {term?.expansion && <div className="text-bx-gray-300 mt-0.5">{term.expansion}</div>}
          {term?.definition && <div className="text-bx-gray-400 mt-1 leading-relaxed">{term.definition}</div>}
          {prefix && PREFIX_LEGEND[prefix] && <div className="text-bx-gray-400 mt-1">{PREFIX_LEGEND[prefix]}</div>}
          {tip.id === schematic.subject && <div className="text-bx-gray-400 mt-1">Subject</div>}
          {tip.dotted && <div className="text-bx-gray-400 mt-1">On a dotted line</div>}
          {onCodeClick && <div className="text-bx-gray-500 mt-1">Select to open in ATLAS</div>}
        </div>
      )}
    </div>
  );
}
