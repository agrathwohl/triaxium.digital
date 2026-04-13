'use client';

import { useState, useRef, useEffect } from 'react';
import BraxtonRenderer from '@/components/BraxtonRenderer';
import { Schematic } from '@/types';
import { ArrowLeft, RefreshCw, Menu, X } from 'lucide-react';
import Link from 'next/link';

interface LayoutDemoClientProps {
  schematics: Schematic[];
}

export default function LayoutDemoClient({ schematics }: LayoutDemoClientProps) {
  const [selectedSchematic, setSelectedSchematic] = useState<Schematic>(schematics[0]);
  const [key, setKey] = useState(0);
  const [listOpen, setListOpen] = useState(false);
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

  if (schematics.length === 0) {
    return <div className="min-h-screen bg-bx-black text-bx-gray-400 flex items-center justify-center font-mono">No schematics found.</div>;
  }

  return (
    <div className="min-h-screen bg-bx-black">
      <header className="bg-bx-surface border-b border-bx-trace px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setListOpen(!listOpen)}
              className="lg:hidden p-1.5 text-bx-gray-400 hover:text-bx-white"
            >
              {listOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 text-bx-gray-400 hover:text-bx-white transition-colors font-mono text-xs sm:text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">BACK</span>
            </Link>
            <div className="hidden sm:block h-4 w-px bg-bx-trace" />
            <h1 className="text-sm sm:text-lg font-mono font-bold text-bx-white tracking-wider uppercase">
              Layout Demo
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:inline font-mono text-xs text-bx-white">
              {schematics.length} loaded
            </span>
            <button
              onClick={() => setKey(k => k + 1)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-bx-surface border border-bx-trace-light text-bx-white font-mono text-xs sm:text-sm hover:border-bx-gray-300 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">REGEN</span>
            </button>
          </div>
        </div>
      </header>

      <main className="p-3 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Schematic Selector — mobile overlay, desktop static */}
          <>
            {listOpen && (
              <div className="lg:hidden fixed inset-0 bg-black/60 z-20" onClick={() => setListOpen(false)} />
            )}
            <div className={`
              bg-bx-surface border border-bx-trace p-3 sm:p-4
              fixed lg:static inset-y-0 left-0 z-30 w-72 sm:w-80
              transform transition-transform duration-200
              ${listOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
              lg:w-auto overflow-y-auto
            `}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-mono font-bold text-bx-gray-400 tracking-widest uppercase">
                  Select Schematic
                </h2>
                <button onClick={() => setListOpen(false)} className="lg:hidden p-1 text-bx-gray-400 hover:text-bx-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1 max-h-[70vh] lg:max-h-[500px] overflow-y-auto">
                {schematics.map((schematic) => (
                  <button
                    key={schematic.id}
                    onClick={() => { setSelectedSchematic(schematic); setKey(k => k + 1); setListOpen(false); }}
                    className={`w-full text-left px-3 py-2 font-mono text-xs transition-colors border-b border-bx-trace ${
                      selectedSchematic.id === schematic.id
                        ? 'bg-bx-surface-alt text-bx-white'
                        : 'text-bx-gray-400 hover:bg-bx-surface-alt/50 hover:text-bx-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{schematic.subject}</span>
                      <span className={`text-[10px] px-1 py-0.5 border ${
                        schematic.volume === 1 ? 'border-blue-700 text-blue-400' :
                        schematic.volume === 2 ? 'border-red-700 text-red-400' :
                        'border-yellow-700 text-yellow-400'
                      }`}>
                        V{schematic.volume}
                      </span>
                    </div>
                    <div className="text-bx-gray-600 mt-0.5 truncate">{schematic.title}</div>
                    <div className="text-bx-gray-600 mt-0.5">{schematic.type} | {schematic.terms.length} terms</div>
                  </button>
                ))}
              </div>
            </div>
          </>

          {/* Renderer */}
          <div className="lg:col-span-2 bg-bx-surface border border-bx-trace p-3 sm:p-4">
            <div className="flex items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2">
              <div className="min-w-0 flex-1">
                <button
                  onClick={() => setListOpen(true)}
                  className="lg:hidden text-bx-gray-500 hover:text-bx-gray-300 font-mono text-[10px] mb-1"
                >
                  BROWSE SCHEMATICS
                </button>
                <h2 className="text-xs sm:text-base font-mono font-bold text-bx-white truncate">
                  {selectedSchematic.title}
                </h2>
                <p className="text-[10px] sm:text-xs font-mono text-bx-gray-500 mt-1">
                  VOL {selectedSchematic.volume} | {selectedSchematic.section} | P.{selectedSchematic.page}
                </p>
              </div>
              <span className="flex-shrink-0 px-2 py-1 border border-bx-trace-light text-bx-gray-400 font-mono text-[10px] sm:text-xs uppercase">
                {selectedSchematic.type}
              </span>
            </div>

            <div ref={rendererContainerRef} className="bg-bx-black border border-bx-trace overflow-hidden">
              <BraxtonRenderer
                key={key}
                schematic={selectedSchematic}
                width={rendererWidth}
                height={Math.min(500, Math.max(280, rendererWidth * 0.6))}
              />
            </div>

            {/* Details */}
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-bx-black border border-bx-trace">
              <h3 className="text-xs font-mono font-bold text-bx-gray-400 mb-2 tracking-widest">DESCRIPTION</h3>
              <p className="text-xs sm:text-sm font-mono text-bx-gray-500 leading-relaxed">
                {selectedSchematic.description || 'No description available.'}
              </p>

              <h3 className="text-xs font-mono font-bold text-bx-gray-400 mt-3 sm:mt-4 mb-2 tracking-widest">TERMS</h3>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {selectedSchematic.terms.map((term) => (
                  <span
                    key={term.termId}
                    className={`px-1.5 sm:px-2 py-0.5 sm:py-1 font-mono text-[10px] sm:text-xs border ${
                      term.isSubject
                        ? 'border-blue-600 text-blue-400'
                        : 'border-bx-trace-light text-bx-gray-400'
                    }`}
                  >
                    {term.prefix && <span className="text-yellow-500 mr-1">{term.prefix}</span>}
                    {term.termId}
                  </span>
                ))}
              </div>

              <h3 className="text-xs font-mono font-bold text-bx-gray-400 mt-3 sm:mt-4 mb-2 tracking-widest">RELATIONSHIPS</h3>
              <div className="space-y-1">
                {selectedSchematic.relationships.map((rel, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] sm:text-xs font-mono">
                    <span className="text-bx-gray-300">{rel.from}</span>
                    <span className={`w-6 sm:w-8 h-px ${
                      rel.type === 'thick' ? 'bg-bx-white h-0.5' :
                      rel.type === 'dashed' ? 'bg-bx-gray-500 border-t border-dashed border-bx-gray-500' :
                      'bg-braxton-v1'
                    }`} />
                    <span className="text-bx-gray-300">{rel.to}</span>
                    <span className="text-bx-gray-600 ml-1 sm:ml-2">({rel.type})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Layout Config */}
        <div className="mt-4 sm:mt-6 bg-bx-surface border border-bx-trace p-3 sm:p-4">
          <h2 className="text-xs font-mono font-bold text-bx-gray-400 mb-3 tracking-widest uppercase">Layout Config</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-[10px] sm:text-xs font-mono">
            <div><span className="text-bx-gray-600">TYPE:</span><span className="text-bx-white ml-2">{selectedSchematic.type}</span></div>
            <div><span className="text-bx-gray-600">RANK DIR:</span><span className="text-bx-white ml-2">LR</span></div>
            <div><span className="text-bx-gray-600">SUBJECT:</span><span className="text-bx-white ml-2">LEFT-CENTER</span></div>
            <div><span className="text-bx-gray-600">EDGE WT:</span><span className="text-bx-white ml-2">THK=10 SOL=5 DSH=2</span></div>
          </div>
        </div>

        {/* Line Types */}
        <div className="mt-4 sm:mt-6 bg-bx-surface border border-bx-trace p-3 sm:p-4">
          <h2 className="text-xs font-mono font-bold text-bx-gray-400 mb-3 tracking-widest uppercase">Line Types</h2>
          <div className="flex flex-wrap gap-4 sm:gap-8 text-[10px] sm:text-xs font-mono">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="inline-block w-6 sm:w-8 h-0.5 bg-bx-white" />
              <span className="text-bx-gray-400">Thick (primary)</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="inline-block w-6 sm:w-8 h-px bg-braxton-v1" />
              <span className="text-bx-gray-400">Solid (direct)</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="inline-block w-6 sm:w-8 h-px border-t border-dashed border-bx-gray-500" />
              <span className="text-bx-gray-400">Dashed (context)</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
