'use client';

import { ReactNode, useState } from 'react';

export type Tip = { x: number; y: number; body: ReactNode } | null;

export function useTip() {
  const [tip, setTip] = useState<Tip>(null);
  const bind = (body: ReactNode) => ({
    onMouseMove: (e: React.MouseEvent) => setTip({ x: e.clientX, y: e.clientY, body }),
    onMouseLeave: () => setTip(null),
    onFocus: (e: React.FocusEvent<Element>) => { const r = e.currentTarget.getBoundingClientRect(); setTip({ x: r.left, y: r.bottom, body }); },
    onBlur: () => setTip(null),
  });
  return { tip, bind };
}

export function VizTip({ tip }: { tip: Tip }) {
  if (!tip) return null;
  return (
    <div
      className="fixed z-50 pointer-events-none px-3 py-2 bg-bx-surface border border-bx-trace-light text-xs font-mono max-w-xs text-bx-gray-300 leading-relaxed"
      style={{ left: Math.max(8, Math.min(tip.x + 12, window.innerWidth - 336)), top: tip.y + 12 }}
    >
      {tip.body}
    </div>
  );
}
