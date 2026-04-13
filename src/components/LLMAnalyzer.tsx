'use client';

import { useState, useRef, useEffect } from 'react';
import { Schematic } from '@/types';
import BraxtonRenderer from '@/components/BraxtonRenderer';
import { Loader2, Link, FileText, Sparkles } from 'lucide-react';

interface LLMAnalyzerProps {
  onSchematicGenerated: (schematic: Partial<Schematic>) => void;
}

export default function LLMAnalyzer({ onSchematicGenerated }: LLMAnalyzerProps) {
  const [input, setInput] = useState('');
  const [isUrl, setIsUrl] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const diagramRef = useRef<HTMLDivElement>(null);
  const [diagramWidth, setDiagramWidth] = useState(600);

  useEffect(() => {
    const el = diagramRef.current;
    if (!el) return;
    const measure = () => setDiagramWidth(el.clientWidth);
    measure();
    const obs = new ResizeObserver(measure);
    obs.observe(el);
    return () => obs.disconnect();
  }, [result]);

  const handleAnalyze = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const isInputUrl = input.startsWith('http://') || input.startsWith('https://');

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [isInputUrl ? 'url' : 'text']: input,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setResult(data.analysis);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze');
    } finally {
      setLoading(false);
    }
  };

  // Build a full Schematic object from the result for rendering
  const resultSchematic: Schematic | null = result ? {
    id: result.id || `llm-${Date.now()}`,
    volume: result.volume || 1,
    section: result.section || 'LLM',
    page: result.page || 0,
    subject: result.subject || 'ANALYSIS',
    title: result.title || 'LLM Analysis',
    type: result.type || 'tree',
    description: result.description || result.analysis || '',
    terms: result.terms || [],
    relationships: result.relationships || [],
  } : null;

  const handleAdd = () => {
    if (!resultSchematic) return;
    // Generate unique id each time to avoid duplicate keys
    onSchematicGenerated({ ...resultSchematic, id: `llm-${Date.now()}` });
  };

  return (
    <div className="bg-bx-surface border border-bx-trace p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-yellow-500" />
        <h3 className="text-base font-mono font-bold text-bx-white">
          Braxtonian LLM Analysis
        </h3>
      </div>

      <p className="text-bx-gray-400 text-xs font-mono mb-4">
        Submit a URL or text for Claude to analyze through the Tri-Axium framework and generate a schematic.
      </p>

      <div className="space-y-3">
        <div className="flex gap-2">
          <button
            onClick={() => setIsUrl(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border ${
              !isUrl ? 'border-bx-trace-light bg-gray-800 text-bx-white' : 'border-transparent text-bx-gray-500 hover:text-bx-gray-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Text
          </button>
          <button
            onClick={() => setIsUrl(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border ${
              isUrl ? 'border-bx-trace-light bg-gray-800 text-bx-white' : 'border-transparent text-bx-gray-500 hover:text-bx-gray-300'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            URL
          </button>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isUrl ? 'https://example.com/article...' : 'Paste text to analyze...'}
          rows={isUrl ? 2 : 6}
          className="w-full bg-bx-black border border-bx-trace-light px-4 py-3 text-sm font-mono text-bx-white placeholder-bx-gray-500 focus:outline-none focus:border-bx-trace-light"
        />

        <button
          onClick={handleAnalyze}
          disabled={loading || !input.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 border border-bx-trace-light text-bx-white font-mono text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:border-bx-trace-light transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Schematic
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-950/30 border border-red-900/50 text-red-400 text-xs font-mono">
          {error}
        </div>
      )}

      {resultSchematic && (
        <div className="mt-6 border-t border-bx-trace pt-6 space-y-4">
          {/* Rendered diagram */}
          <div ref={diagramRef} className="bg-bx-black border border-bx-trace overflow-hidden">
            <BraxtonRenderer
              schematic={resultSchematic}
              width={diagramWidth}
              height={Math.min(400, Math.max(250, diagramWidth * 0.5))}
            />
          </div>

          {/* Analysis text */}
          <div className="bg-bx-black border border-bx-trace p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-0.5 border text-xs font-mono ${
                resultSchematic.volume === 2 ? 'border-red-700 text-red-400' :
                resultSchematic.volume === 3 ? 'border-yellow-700 text-yellow-400' :
                'border-blue-700 text-blue-400'
              }`}>
                VOL {resultSchematic.volume}
              </span>
              <span className="text-bx-gray-500 text-xs font-mono">
                {resultSchematic.type}
              </span>
              <span className="text-bx-gray-500 text-xs font-mono">
                {resultSchematic.subject}
              </span>
            </div>

            <h4 className="text-sm font-mono font-bold text-bx-white mb-2">
              {resultSchematic.title}
            </h4>

            <p className="text-xs font-mono text-bx-gray-400 leading-relaxed mb-3">
              {result.analysis || result.description}
            </p>

            {result.insights && result.insights.length > 0 && (
              <div>
                <h5 className="text-xs font-mono font-bold text-bx-gray-400 mb-1 tracking-widest">INSIGHTS</h5>
                <ul className="space-y-1">
                  {result.insights.map((insight: string, i: number) => (
                    <li key={i} className="text-xs font-mono text-bx-gray-300 flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">-</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            onClick={handleAdd}
            className="w-full px-4 py-2 bg-gray-800 border border-bx-trace-light text-bx-white font-mono text-xs hover:border-bx-trace-light transition-colors"
          >
            Add to Schematics
          </button>
        </div>
      )}
    </div>
  );
}
