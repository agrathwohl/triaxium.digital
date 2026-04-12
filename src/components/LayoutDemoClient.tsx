'use client';

import { useState, useRef, useEffect } from 'react';
import BraxtonRenderer from '@/components/BraxtonRenderer';
import { Schematic } from '@/types';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface LayoutDemoClientProps {
  schematics: Schematic[];
}

export default function LayoutDemoClient({ schematics }: LayoutDemoClientProps) {
  const [selectedSchematic, setSelectedSchematic] = useState<Schematic>(schematics[0]);
  const [key, setKey] = useState(0);
  const rendererContainerRef = useRef<HTMLDivElement>(null);
  const [rendererWidth, setRendererWidth] = useState(900);

  useEffect(() => {
    const el = rendererContainerRef.current;
    if (!el) return;
    const measure = () => setRendererWidth(el.clientWidth);
    measure();
    const obs = new ResizeObserver(measure);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleRegenerate = () => {
    setKey(prev => prev + 1);
  };

  if (schematics.length === 0) {
    return <div className="min-h-screen bg-bx-black text-bx-gray-400 flex items-center justify-center">No schematics found.</div>;
  }

  return (
    <div className="min-h-screen bg-bx-black">
      <header className="bg-bx-surface border-b border-bx-trace px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-bx-gray-400 hover:text-bx-white transition-colors font-mono text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              BACK
            </Link>
            <div className="h-4 w-px bg-bx-trace" />
            <h1 className="text-lg font-mono font-bold text-bx-white tracking-wider uppercase">
              Layout Demo
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-bx-green">
              {schematics.length} schematics loaded
            </span>
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-2 px-3 py-2 bg-bx-surface border border-bx-trace text-bx-white font-mono text-sm hover:border-bx-green transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              REGEN
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Schematic Selector */}
          <div className="bg-bx-surface border border-bx-trace p-4">
            <h2 className="text-xs font-mono font-bold text-bx-green mb-3 tracking-widest uppercase">
              Select Schematic
            </h2>
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {schematics.map((schematic) => (
                <button
                  key={schematic.id}
                  onClick={() => setSelectedSchematic(schematic)}
                  className={`w-full text-left px-3 py-2 font-mono text-sm transition-colors border ${
                    selectedSchematic.id === schematic.id
                      ? 'bg-bx-green/10 border-bx-green text-bx-white'
                      : 'bg-transparent border-transparent text-bx-gray-300 hover:border-bx-trace hover:bg-bx-surface-alt'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs">{schematic.subject}</span>
                    <span className={`text-xs px-1.5 py-0.5 border ${
                      schematic.volume === 1 ? 'border-braxton-v1 text-braxton-v1' :
                      schematic.volume === 2 ? 'border-braxton-v2 text-braxton-v2' :
                      'border-braxton-v3 text-braxton-v3'
                    }`}>
                      V{schematic.volume}
                    </span>
                  </div>
                  <div className="text-xs opacity-60 mt-1 truncate">
                    {schematic.title}
                  </div>
                  <div className="text-xs opacity-40 mt-0.5">
                    {schematic.type} | {schematic.terms.length} terms
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Renderer */}
          <div className="col-span-2 bg-bx-surface border border-bx-trace p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-mono font-bold text-bx-white">
                  {selectedSchematic.title}
                </h2>
                <p className="text-xs font-mono text-bx-gray-400 mt-1">
                  VOL {selectedSchematic.volume} | {selectedSchematic.section} | P.{selectedSchematic.page}
                </p>
              </div>
              <span className="px-2 py-1 border border-bx-trace text-bx-gray-300 font-mono text-xs uppercase">
                {selectedSchematic.type}
              </span>
            </div>

            <div ref={rendererContainerRef} className="bg-bx-black border border-bx-trace overflow-hidden schematic-grid">
              <BraxtonRenderer
                key={key}
                schematic={selectedSchematic}
                width={rendererWidth}
                height={500}
              />
            </div>

            {/* Details */}
            <div className="mt-4 p-4 bg-bx-black border border-bx-trace">
              <h3 className="text-xs font-mono font-bold text-bx-green mb-2 tracking-widest">DESCRIPTION</h3>
              <p className="text-sm font-mono text-bx-gray-400 leading-relaxed">
                {selectedSchematic.description || 'No description available.'}
              </p>

              <h3 className="text-xs font-mono font-bold text-bx-green mt-4 mb-2 tracking-widest">TERMS</h3>
              <div className="flex flex-wrap gap-2">
                {selectedSchematic.terms.map((term) => (
                  <span
                    key={term.termId}
                    className={`px-2 py-1 font-mono text-xs border ${
                      term.isSubject
                        ? 'border-bx-green text-bx-green bg-bx-green/5'
                        : 'border-bx-trace text-bx-gray-300'
                    }`}
                  >
                    {term.prefix && <span className="text-bx-amber mr-1">{term.prefix}</span>}
                    {term.termId}
                  </span>
                ))}
              </div>

              <h3 className="text-xs font-mono font-bold text-bx-green mt-4 mb-2 tracking-widest">RELATIONSHIPS</h3>
              <div className="space-y-1">
                {selectedSchematic.relationships.map((rel, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-bx-gray-300">{rel.from}</span>
                    <span className={`w-8 h-px ${
                      rel.type === 'thick' ? 'bg-bx-white h-0.5' :
                      rel.type === 'dashed' ? 'bg-bx-gray-500 border-t border-dashed border-bx-gray-500' :
                      'bg-bx-gray-400'
                    }`} />
                    <span className="text-bx-gray-300">{rel.to}</span>
                    <span className="text-bx-gray-500 ml-2">({rel.type})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Algorithm Info */}
        <div className="mt-6 bg-bx-surface border border-bx-trace p-4">
          <h2 className="text-xs font-mono font-bold text-bx-green mb-3 tracking-widest uppercase">
            Layout Config
          </h2>
          <div className="grid grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-bx-gray-500">TYPE:</span>
              <span className="text-bx-white ml-2">{selectedSchematic.type}</span>
            </div>
            <div>
              <span className="text-bx-gray-500">RANK DIR:</span>
              <span className="text-bx-white ml-2">LR
              </span>
            </div>
            <div>
              <span className="text-bx-gray-500">SUBJECT POS:</span>
              <span className="text-bx-white ml-2">LEFT-CENTER</span>
            </div>
            <div>
              <span className="text-bx-gray-500">EDGE WT:</span>
              <span className="text-bx-white ml-2">THK=10 SOL=5 DSH=2</span>
            </div>
          </div>
        </div>

        {/* Line Types Legend */}
        <div className="mt-6 bg-bx-surface border border-bx-trace p-4">
          <h2 className="text-xs font-mono font-bold text-bx-green mb-3 tracking-widest uppercase">
            Line Types
          </h2>
          <div className="flex gap-8 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="inline-block w-8 h-0.5 bg-white" />
              <span className="text-bx-gray-300">Thick (primary)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-block w-8 h-px bg-gray-400" />
              <span className="text-bx-gray-300">Solid (direct)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-block w-8 h-px border-t border-dashed border-gray-500" />
              <span className="text-bx-gray-300">Dashed (context)</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
