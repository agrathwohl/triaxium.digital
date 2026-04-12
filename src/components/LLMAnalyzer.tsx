'use client';

import { useState } from 'react';
import { Schematic } from '@/types';
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
      onSchematicGenerated(data.analysis);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold text-white">
          Braxtonian LLM Analysis
        </h3>
      </div>

      <p className="text-gray-400 text-sm mb-4">
        Submit a URL or text to have Claude analyze it through the Tri-Axium framework
        and generate a schematic diagram.
      </p>

      <div className="space-y-4">
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setIsUrl(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${
              !isUrl ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            Text
          </button>
          <button
            onClick={() => setIsUrl(true)}
            className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${
              isUrl ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Link className="w-4 h-4" />
            URL
          </button>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isUrl
              ? 'https://example.com/news/article...'
              : 'Paste text to analyze through Braxtonian framework...'
          }
          rows={isUrl ? 2 : 8}
          className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
        />

        <button
          onClick={handleAnalyze}
          disabled={loading || !input.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-purple-700 transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing through Tri-Axium...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Braxtonian Schematic
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 border-t border-gray-800 pt-6">
          <h4 className="font-semibold text-white mb-3">Analysis Result</h4>
          
          <div className="bg-gray-950 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                result.volume === 2 ? 'bg-red-900/50 text-red-400' :
                result.volume === 3 ? 'bg-yellow-900/50 text-yellow-400' :
                'bg-blue-900/50 text-blue-400'
              }`}>
                Volume {result.volume}
              </span>
              <span className="text-gray-500 text-sm">
                {result.type} schematic
              </span>
            </div>

            <h5 className="text-lg font-medium text-white mb-2">
              {result.title}
            </h5>

            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              {result.analysis}
            </p>

            {result.insights && result.insights.length > 0 && (
              <div className="mb-4">
                <h6 className="text-sm font-medium text-gray-400 mb-2">
                  Key Insights:
                </h6>
                <ul className="space-y-1">
                  {result.insights.map((insight: string, i: number) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.subject && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-800">
                <span className="text-gray-500 text-sm">Subject:</span>
                <span className="px-2 py-1 bg-blue-900/50 text-blue-400 rounded text-sm font-mono">
                  {result.subject}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => onSchematicGenerated(result)}
            className="mt-4 w-full px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors"
          >
            Add to Schematics
          </button>
        </div>
      )}
    </div>
  );
}
