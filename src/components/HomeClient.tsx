'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Schematic, ViewMode } from '@/types';
import { terms as allTerms } from '@/data/schematics-full';
import { termFamilies } from '@/data/schematics';

import BraxtonRenderer from '@/components/BraxtonRenderer';
import NetworkView from '@/components/NetworkView';
import Workspace from '@/components/Workspace';
import { Search, GitBranch, Network, Edit3, Filter, BookOpen, Info, RefreshCw } from 'lucide-react';

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

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 text-white border-b border-gray-800">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-gray-600 flex items-center justify-center font-mono font-bold text-xs tracking-widest text-gray-300">
              TAW
            </div>
            <div>
              <h1 className="font-mono font-bold text-sm tracking-wider">TRI-AXIUM DIGITAL</h1>
              <p className="text-xs text-gray-500 font-mono">Braxtonian Knowledge System</p>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search terms, schematics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 px-10 py-2 text-sm font-mono focus:outline-none focus:border-gray-500"
              />
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 bg-gray-950 border border-gray-800 p-1">
            {([
              { mode: 'tree' as ViewMode, icon: GitBranch, label: 'SCHEMATICS' },
              { mode: 'network' as ViewMode, icon: Network, label: 'NETWORK' },
              { mode: 'workspace' as ViewMode, icon: Edit3, label: 'WORKSPACE' },
            ]).map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono transition-colors ${
                  viewMode === mode
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar — filters + schematic list */}
        {viewMode === 'tree' && (
          <aside className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col overflow-hidden">
            {/* Filters */}
            <div className="p-3 border-b border-gray-800">
              <h3 className="flex items-center gap-2 text-xs font-mono font-bold text-gray-400 mb-2 tracking-widest">
                <Filter className="w-3 h-3" />
                FAMILIES
              </h3>
              <div className="flex flex-wrap gap-1">
                {termFamilies.map((family) => (
                  <button
                    key={family.id}
                    onClick={() => toggleFamily(family.id)}
                    className={`flex items-center gap-1.5 px-2 py-1 text-xs font-mono transition-colors border ${
                      selectedFamilies.includes(family.id)
                        ? 'border-gray-500 text-white bg-gray-800'
                        : 'border-transparent text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <span className="w-2 h-2" style={{ backgroundColor: family.color }} />
                    {family.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Schematic list */}
            <div className="p-3 border-b border-gray-800">
              <span className="text-xs font-mono text-gray-500">
                {filteredSchematics.length} of {schematics.length} schematics
              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredSchematics.map((schematic) => (
                <button
                  key={schematic.id}
                  onClick={() => { setSelectedSchematic(schematic); setRendererKey(k => k + 1); }}
                  className={`w-full text-left px-3 py-2 font-mono text-xs border-b border-gray-800 transition-colors ${
                    selectedSchematic?.id === schematic.id
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{schematic.subject}</span>
                    <span className={`px-1 py-0.5 border text-[10px] ${
                      schematic.volume === 1 ? 'border-blue-700 text-blue-400' :
                      schematic.volume === 2 ? 'border-red-700 text-red-400' :
                      'border-yellow-700 text-yellow-400'
                    }`}>
                      V{schematic.volume}
                    </span>
                  </div>
                  <div className="text-gray-600 mt-0.5 truncate">{schematic.title}</div>
                </button>
              ))}
              {filteredSchematics.length === 0 && (
                <div className="text-center py-8 text-gray-600 text-xs font-mono">
                  No matches
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {viewMode === 'tree' && selectedSchematic && (
            <div className="p-4 flex flex-col h-full">
              {/* Schematic header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-mono font-bold text-sm text-white">{selectedSchematic.title}</h2>
                  <p className="font-mono text-xs text-gray-500 mt-0.5">
                    VOL {selectedSchematic.volume} | {selectedSchematic.section} | P.{selectedSchematic.page} | {selectedSchematic.type}
                  </p>
                </div>
                <button
                  onClick={() => setRendererKey(k => k + 1)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 border border-gray-700 text-gray-400 font-mono text-xs hover:border-gray-500 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  REGEN
                </button>
              </div>

              {/* Renderer — fills available space */}
              <div ref={rendererRef} className="flex-1 min-h-0 bg-gray-950 border border-gray-800 overflow-hidden">
                <BraxtonRenderer
                  key={rendererKey}
                  schematic={selectedSchematic}
                  width={rendererWidth}
                  height={500}
                />
              </div>

              {/* Details below */}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="bg-gray-900 border border-gray-800 p-3">
                  <h3 className="text-xs font-mono font-bold text-gray-400 mb-1 tracking-widest">DESCRIPTION</h3>
                  <p className="text-xs font-mono text-gray-500 leading-relaxed">
                    {selectedSchematic.description || 'No description.'}
                  </p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-3">
                  <h3 className="text-xs font-mono font-bold text-gray-400 mb-1 tracking-widest">TERMS</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedSchematic.terms.map((term) => (
                      <span
                        key={term.termId}
                        className={`px-1.5 py-0.5 font-mono text-[10px] border ${
                          term.isSubject
                            ? 'border-blue-600 text-blue-400'
                            : 'border-gray-700 text-gray-400'
                        }`}
                      >
                        {term.prefix && <span className="text-yellow-500 mr-0.5">{term.prefix}</span>}
                        {term.termId}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Line types legend */}
              <div className="mt-3 flex gap-6 text-xs font-mono text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-6 h-0.5 bg-white" />
                  <span>Thick (primary)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-6 h-px bg-gray-400" />
                  <span>Solid (direct)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-6 h-px border-t border-dashed border-gray-500" />
                  <span>Dashed (context)</span>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'tree' && !selectedSchematic && (
            <div className="flex-1 flex items-center justify-center text-gray-600 font-mono text-sm">
              Select a schematic from the list
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
