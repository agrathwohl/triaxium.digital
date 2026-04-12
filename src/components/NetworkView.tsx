'use client';

import { Schematic, Term } from '@/types';
import { useMemo } from 'react';
import { getVolumeColor, getCategoryColor } from '@/lib/utils';

interface NetworkViewProps {
  schematics: Schematic[];
  terms: Term[];
  selectedSchematic: Schematic | null;
  onSelectSchematic: (schematic: Schematic) => void;
}

export default function NetworkView({ 
  schematics, 
  terms,
  selectedSchematic, 
  onSelectSchematic 
}: NetworkViewProps) {
  // Build network data
  const networkData = useMemo(() => {
    const nodes = terms.map(term => ({
      id: term.id,
      label: term.abbreviation,
      color: getCategoryColor(term.category),
      volume: term.volume,
    }));

    const links: { source: string; target: string; count: number }[] = [];
    
    schematics.forEach(schematic => {
      schematic.terms.forEach((term1, i) => {
        schematic.terms.forEach((term2, j) => {
          if (i < j) {
            const existing = links.find(
              l => (l.source === term1.termId && l.target === term2.termId) ||
                   (l.source === term2.termId && l.target === term1.termId)
            );
            if (existing) {
              existing.count++;
            } else {
              links.push({ source: term1.termId, target: term2.termId, count: 1 });
            }
          }
        });
      });
    });

    return { nodes, links };
  }, [schematics, terms]);

  // Simple grid layout for now
  const gridLayout = useMemo(() => {
    const cols = 6;
    return networkData.nodes.map((node, i) => ({
      ...node,
      x: (i % cols) * 150 + 75,
      y: Math.floor(i / cols) * 100 + 50,
    }));
  }, [networkData]);

  return (
    <div className="flex-1 bg-gray-950 overflow-auto p-3 sm:p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">
          Term Network
        </h2>
        <p className="text-gray-400 text-sm">
          Visualize connections between Braxtonian terms across all schematics
        </p>
      </div>

      {/* Network Visualization Placeholder */}
      <div className="relative bg-gray-900 rounded-lg border border-gray-800 p-8 min-h-[500px]">
        <svg viewBox="0 0 900 600" className="w-full h-full">
          {/* Draw links */}
          {networkData.links.map((link, i) => {
            const sourceNode = gridLayout.find(n => n.id === link.source);
            const targetNode = gridLayout.find(n => n.id === link.target);
            if (!sourceNode || !targetNode) return null;
            
            return (
              <line
                key={i}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke="#4b5563"
                strokeWidth={Math.min(link.count, 3)}
                opacity={0.3}
              />
            );
          })}

          {/* Draw nodes */}
          {gridLayout.map((node) => (
            <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
              <circle
                r={20}
                fill={node.color}
                stroke="#fff"
                strokeWidth={2}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
              <text
                textAnchor="middle"
                dy={5}
                className="text-xs font-bold fill-white pointer-events-none"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="absolute top-4 right-4 bg-gray-800 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-white mb-2">Term Families</h4>
          <div className="space-y-1">
            {[
              { label: 'Affinity', color: '#ef4444' },
              { label: 'Information', color: '#3b82f6' },
              { label: 'Vibrational', color: '#8b5cf6' },
              { label: 'Reality', color: '#10b981' },
              { label: 'Composite', color: '#f59e0b' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-300">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="text-2xl font-bold text-white">{networkData.nodes.length}</div>
          <div className="text-sm text-gray-400">Terms</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="text-2xl font-bold text-white">{networkData.links.length}</div>
          <div className="text-sm text-gray-400">Connections</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="text-2xl font-bold text-white">
            {(networkData.links.length / networkData.nodes.length).toFixed(2)}
          </div>
          <div className="text-sm text-gray-400">Avg Connections</div>
        </div>
      </div>
    </div>
  );
}
