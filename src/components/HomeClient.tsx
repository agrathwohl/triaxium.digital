'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Schematic, ViewMode } from '@/types';
import { terms as allTerms } from '@/data/schematics-full';
import { termFamilies } from '@/data/schematics';

import BraxtonRenderer from '@/components/BraxtonRenderer';
import NetworkView from '@/components/NetworkView';
import Workspace from '@/components/Workspace';
import { Search, GitBranch, Network, Edit3, Filter, RefreshCw, Menu, X, ChevronLeft, ChevronDown, ChevronRight } from 'lucide-react';

interface HomeClientProps {
  schematics: Schematic[];
}

export default function HomeClient({ schematics }: HomeClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [selectedSchematic, setSelectedSchematic] = useState<Schematic | null>(schematics[0] || null);
  const [userSchematics, setUserSchematics] = useState<Schematic[]>([]);
  const [rendererKey, setRendererKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [familiesOpen, setFamiliesOpen] = useState(false);
  const rendererRef = useRef<HTMLDivElement>(null);
  const [rendererWidth, setRendererWidth] = useState(800);

  useEffect(() => {
    const el = rendererRef.current;
    if (!el) return;
    const measure = () => setRendererWidth(el.clientWidth);
    measure();
    const obs = new ResizeObserver(measure);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const filteredSchematics = useMemo(() => {
    return schematics.filter((schematic) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        schematic.title.toLowerCase().includes(q) ||
        schematic.subject.toLowerCase().includes(q) ||
        schematic.id.toLowerCase().includes(q) ||
        schematic.description?.toLowerCase().includes(q);

      const matchesFamilies =
        selectedFamilies.length === 0 ||
        schematic.terms.some((term) => {
          const termData = allTerms.find((t) => t.id === term.termId);
          return termData && selectedFamilies.includes(termData.category);
        });

      return matchesSearch && matchesFamilies;
    });
  }, [schematics, searchQuery, selectedFamilies]);

  const toggleFamily = (family: string) => {
    setSelectedFamilies((prev) =>
      prev.includes(family) ? prev.filter((f) => f !== family) : [...prev, family]
    );
  };

  const handleSaveSchematic = (schematic: Schematic) => {
    setUserSchematics((prev) => [...prev, schematic]);
  };

  const handleSelectSchematic = (schematic: Schematic) => {
    setSelectedSchematic(schematic);
    setRendererKey(k => k + 1);
    setSidebarOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-bx-black">
      {/* Header */}
      <header className="bg-bx-surface border-b border-bx-trace">
        <div className="flex items-center justify-between px-3 sm:px-6 py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            {viewMode === 'tree' && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-1.5 text-bx-gray-400 hover:text-bx-white"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
            <img src="/TCF_logo_ICO.webp" alt="Tri-Centric Foundation" className="w-7 h-7 sm:w-8 sm:h-8" />
            <div className="hidden sm:block">
              <h1 className="font-bold text-sm tracking-wider text-bx-white">TRI-AXIUM DIGITAL</h1>
              <p className="text-xs text-bx-gray-500">Braxtonian Knowledge System</p>
            </div>
            <h1 className="sm:hidden font-bold text-xs tracking-wider text-bx-white">TAW</h1>
          </div>

          <div className="hidden md:block flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bx-gray-500" />
              <input
                type="text"
                placeholder="Search terms, schematics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-bx-black border border-bx-trace px-10 py-2 text-sm text-bx-white placeholder-bx-gray-500 focus:outline-none focus:border-bx-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1 bg-bx-black border border-bx-trace p-0.5 sm:p-1">
            {([
              { mode: 'tree' as ViewMode, icon: GitBranch, label: 'SCHEMATICS' },
              { mode: 'network' as ViewMode, icon: Network, label: 'NETWORK' },
              { mode: 'workspace' as ViewMode, icon: Edit3, label: 'WORKSPACE' },
            ]).map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => { setViewMode(mode); setSidebarOpen(false); }}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs transition-colors ${
                  viewMode === mode
                    ? 'bg-bx-surface-alt text-bx-white'
                    : 'text-bx-gray-500 hover:text-bx-gray-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="md:hidden px-3 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bx-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-bx-black border border-bx-trace px-10 py-2 text-sm text-bx-white placeholder-bx-gray-500 focus:outline-none focus:border-bx-gray-400"
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {viewMode === 'tree' && (
          <>
            {sidebarOpen && (
              <div className="lg:hidden fixed inset-0 bg-black/60 z-20" onClick={() => setSidebarOpen(false)} />
            )}

            <aside className={`
              bg-bx-surface border-r border-bx-trace flex flex-col overflow-hidden
              fixed lg:static inset-y-0 left-0 z-30
              w-72 sm:w-80
              transform transition-transform duration-200 ease-in-out
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
              top-0 lg:top-auto
            `}>
              <div className="lg:hidden flex items-center justify-between p-3 border-b border-bx-trace">
                <span className="text-xs font-bold text-bx-white tracking-widest">SCHEMATICS</span>
                <button onClick={() => setSidebarOpen(false)} className="p-1 text-bx-gray-400 hover:text-bx-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="border-b border-bx-trace">
                <button
                  onClick={() => setFamiliesOpen(!familiesOpen)}
                  className="w-full flex items-center justify-between p-3 text-xs font-bold text-bx-gray-400 tracking-widest hover:text-bx-gray-300 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Filter className="w-3 h-3" />
                    FAMILIES
                    {selectedFamilies.length > 0 && (
                      <span className="text-bx-white">({selectedFamilies.length})</span>
                    )}
                  </span>
                  {familiesOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {familiesOpen && (
                  <div className="px-3 pb-3 flex flex-wrap gap-1">
                    {termFamilies.map((family) => (
                      <button
                        key={family.id}
                        onClick={() => toggleFamily(family.id)}
                        className={`flex items-center gap-1.5 px-2 py-1 text-xs transition-colors border ${
                          selectedFamilies.includes(family.id)
                            ? 'border-bx-trace-light text-bx-white bg-bx-surface-alt'
                            : 'border-transparent text-bx-gray-500 hover:text-bx-gray-300'
                        }`}
                      >
                        <span className="w-2 h-2" style={{ backgroundColor: family.color }} />
                        {family.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 border-b border-bx-trace">
                <span className="text-xs text-bx-gray-500">
                  {filteredSchematics.length} of {schematics.length} schematics
                </span>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredSchematics.map((schematic) => (
                  <button
                    key={schematic.id}
                    onClick={() => handleSelectSchematic(schematic)}
                    className={`w-full text-left px-3 py-2 text-xs border-b border-bx-trace transition-colors ${
                      selectedSchematic?.id === schematic.id
                        ? 'bg-bx-surface-alt text-bx-white'
                        : 'text-bx-gray-400 hover:bg-bx-surface-alt hover:text-bx-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{schematic.subject}</span>
                      <span className={`px-1 py-0.5 border text-[10px] ${
                        schematic.volume === 1 ? 'border-braxton-v1/40 text-braxton-v1' :
                        schematic.volume === 2 ? 'border-braxton-v2/40 text-braxton-v2' :
                        'border-braxton-v3/40 text-braxton-v3'
                      }`}>
                        V{schematic.volume}
                      </span>
                    </div>
                    <div className="text-bx-gray-600 mt-0.5 truncate">{schematic.title}</div>
                  </button>
                ))}
                {filteredSchematics.length === 0 && (
                  <div className="text-center py-8 text-bx-gray-600 text-xs">No matches</div>
                )}
              </div>
            </aside>
          </>
        )}

        <div className="flex-1 overflow-auto">
          {viewMode === 'tree' && selectedSchematic && (
            <div className="p-3 sm:p-4 flex flex-col h-full">
              <div className="flex items-start sm:items-center justify-between mb-3 gap-2">
                <div className="min-w-0 flex-1">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden flex items-center gap-1 text-bx-gray-500 hover:text-bx-gray-300 text-[10px] mb-1"
                  >
                    <ChevronLeft className="w-3 h-3" />
                    BROWSE
                  </button>
                  <h2 className="font-bold text-xs sm:text-sm text-bx-white truncate">{selectedSchematic.title}</h2>
                  <p className="text-[10px] sm:text-xs text-bx-gray-500 mt-0.5">
                    VOL {selectedSchematic.volume} | {selectedSchematic.section} | P.{selectedSchematic.page} | {selectedSchematic.type}
                  </p>
                </div>
                <button
                  onClick={() => setRendererKey(k => k + 1)}
                  className="flex-shrink-0 flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 bg-bx-surface border border-bx-trace text-bx-gray-400 text-[10px] sm:text-xs hover:border-bx-gray-300 hover:text-bx-white transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span className="hidden sm:inline">REGEN</span>
                </button>
              </div>

              <div ref={rendererRef} className="flex-1 min-h-[250px] sm:min-h-0 bg-bx-black border border-bx-trace overflow-hidden schematic-grid">
                <BraxtonRenderer
                  key={rendererKey}
                  schematic={selectedSchematic}
                  width={rendererWidth}
                  height={Math.min(500, Math.max(280, rendererWidth * 0.6))}
                />
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-bx-surface border border-bx-trace p-3">
                  <h3 className="text-xs font-bold text-bx-white mb-1 tracking-widest">DESCRIPTION</h3>
                  <p className="text-xs text-bx-gray-400 leading-relaxed">
                    {selectedSchematic.description || 'No description.'}
                  </p>
                </div>
                <div className="bg-bx-surface border border-bx-trace p-3">
                  <h3 className="text-xs font-bold text-bx-white mb-1 tracking-widest">TERMS</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedSchematic.terms.map((term) => (
                      <span
                        key={term.termId}
                        className={`px-1.5 py-0.5 text-[10px] border ${
                          term.isSubject
                            ? 'border-bx-gray-300 text-bx-white'
                            : 'border-bx-trace text-bx-gray-300'
                        }`}
                      >
                        {term.prefix && <span className="text-bx-amber mr-0.5">{term.prefix}</span>}
                        {term.termId}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-3 sm:gap-6 text-[10px] sm:text-xs text-bx-gray-500">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-6 h-0.5 bg-bx-white" />
                  <span>Thick (primary)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-6 h-px bg-bx-gray-400" />
                  <span>Solid (direct)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-6 h-px border-t border-dashed border-bx-gray-500" />
                  <span>Dashed (context)</span>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'tree' && !selectedSchematic && (
            <div className="flex-1 flex items-center justify-center text-bx-gray-500 text-sm p-4 text-center">
              <div>
                <p>Select a schematic from the list</p>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden mt-2 px-4 py-2 bg-bx-surface border border-bx-trace text-bx-gray-400 text-xs"
                >
                  OPEN LIST
                </button>
              </div>
            </div>
          )}

          {viewMode === 'network' && (
            <NetworkView
              schematics={schematics}
              terms={allTerms}
              selectedSchematic={selectedSchematic}
              onSelectSchematic={setSelectedSchematic}
            />
          )}

          {viewMode === 'workspace' && (
            <Workspace
              userSchematics={userSchematics}
              onSaveSchematic={handleSaveSchematic}
            />
          )}
        </div>
      </div>
    </div>
  );
}
