'use client';

import { useState } from 'react';
import LLMAnalyzer from '@/components/LLMAnalyzer';
import { Schematic } from '@/types';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function LLMAnalysisPage() {
  const [generatedSchematics, setGeneratedSchematics] = useState<Partial<Schematic>[]>([]);

  const handleSchematicGenerated = (schematic: Partial<Schematic>) => {
    setGeneratedSchematics(prev => [schematic, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Schematics
          </Link>
          <div className="h-4 w-px bg-gray-700" />
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <h1 className="text-xl font-bold text-white">
              LLM-Powered Braxtonian Analysis
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <p className="text-gray-400 max-w-2xl">
            Submit news articles, websites, or any text for analysis through the Tri-Axium framework. 
            Claude will generate a Braxtonian schematic showing vibrational dynamics, 
            spectacle-diversion patterns, affinity alignments, and transformation potential.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Left: Input */}
          <div>
            <LLMAnalyzer onSchematicGenerated={handleSchematicGenerated} />
          </div>

          {/* Right: Generated Schematics */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">
              Generated Schematics
            </h2>
            
            {generatedSchematics.length === 0 ? (
              <div className="bg-gray-900 rounded-lg border border-gray-800 p-8 text-center">
                <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">
                  No schematics generated yet. Submit text on the left to analyze.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {generatedSchematics.map((schematic, i) => (
                  <div 
                    key={i}
                    className="bg-gray-900 rounded-lg border border-gray-800 p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        schematic.volume === 2 ? 'bg-red-900/50 text-red-400' :
                        schematic.volume === 3 ? 'bg-yellow-900/50 text-yellow-400' :
                        'bg-blue-900/50 text-blue-400'
                      }`}>
                        Vol {schematic.volume}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {schematic.type}
                      </span>
                    </div>
                    <h3 className="font-medium text-white mb-2">
                      {schematic.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-3">
                      {schematic.description}
                    </p>
                    {schematic.subject && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-gray-500 text-xs">Subject:</span>
                        <span className="text-xs font-mono text-blue-400">
                          {schematic.subject}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Example Use Cases */}
        <div className="mt-12 border-t border-gray-800 pt-8">
          <h2 className="text-lg font-semibold text-white mb-4">
            Example Use Cases
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                title: 'News Article Analysis',
                description: 'Submit a news URL to reveal spectacle-diversion patterns, information compression, and vibrational dynamics.',
                example: 'https://example.com/politics/article...'
              },
              {
                title: 'Social Media Thread',
                description: 'Paste a viral Twitter/X thread to analyze affinity alignment, social reality dynamics, and transformation potential.',
                example: 'Paste thread text...'
              },
              {
                title: 'Academic Paper',
                description: 'Submit research abstracts to identify composite understanding, aspect-essence perception, and multi-perspective inquiry.',
                example: 'Paste abstract...'
              }
            ].map((useCase, i) => (
              <div key={i} className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                <h3 className="font-medium text-white mb-2">{useCase.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{useCase.description}</p>
                <code className="text-xs text-gray-500 bg-gray-950 px-2 py-1 rounded">
                  {useCase.example}
                </code>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
