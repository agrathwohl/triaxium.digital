'use client';

import { Schematic, Term } from '@/types';
import { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';

interface NetworkViewProps {
  schematics: Schematic[];
  terms: Term[];
  selectedSchematic: Schematic | null;
  onSelectSchematic: (schematic: Schematic) => void;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  category: string;
  volume: number;
  count: number; // how many schematics this term appears in
  expansion: string;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  count: number;
  schematics: string[]; // which schematics contain this pair
}

export default function NetworkView({
  schematics,
  terms,
  selectedSchematic,
  onSelectSchematic,
}: NetworkViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [hoveredTerm, setHoveredTerm] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);

  // Measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      setDimensions({ width: el.clientWidth, height: Math.max(500, el.clientHeight) });
    };
    measure();
    const obs = new ResizeObserver(measure);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Build graph data
  const graphData = useMemo(() => {
    // Count term appearances
    const termCounts: Record<string, number> = {};
    schematics.forEach(s => {
      s.terms.forEach(t => {
        termCounts[t.termId] = (termCounts[t.termId] || 0) + 1;
      });
    });

    // Only include terms that actually appear in schematics
    const activeTermIds = new Set(Object.keys(termCounts));

    const nodes: GraphNode[] = terms
      .filter(t => activeTermIds.has(t.id))
      .map(t => ({
        id: t.id,
        label: t.abbreviation,
        category: t.category,
        volume: t.volume,
        count: termCounts[t.id] || 0,
        expansion: t.expansion,
      }));

    const nodeIds = new Set(nodes.map(n => n.id));

    // Build co-occurrence links
    const linkMap = new Map<string, { count: number; schematics: string[] }>();
    schematics.forEach(s => {
      const termIds = s.terms.map(t => t.termId).filter(id => nodeIds.has(id));
      for (let i = 0; i < termIds.length; i++) {
        for (let j = i + 1; j < termIds.length; j++) {
          const key = [termIds[i], termIds[j]].sort().join('::');
          const existing = linkMap.get(key);
          if (existing) {
            existing.count++;
            existing.schematics.push(s.id);
          } else {
            linkMap.set(key, { count: 1, schematics: [s.id] });
          }
        }
      }
    });

    const links: GraphLink[] = [];
    linkMap.forEach((val, key) => {
      const [source, target] = key.split('::');
      links.push({ source, target, count: val.count, schematics: val.schematics });
    });

    return { nodes, links };
  }, [schematics, terms]);

  // Get schematics that involve the selected term
  const relatedSchematics = useMemo(() => {
    if (!selectedTerm) return [];
    return schematics.filter(s =>
      s.terms.some(t => t.termId === selectedTerm)
    );
  }, [selectedTerm, schematics]);

  // Connected terms for highlighting
  const connectedTerms = useMemo(() => {
    if (!selectedTerm && !hoveredTerm) return null;
    const active = selectedTerm || hoveredTerm;
    const connected = new Set<string>();
    connected.add(active!);
    graphData.links.forEach(l => {
      const src = typeof l.source === 'string' ? l.source : l.source.id;
      const tgt = typeof l.target === 'string' ? l.target : l.target.id;
      if (src === active) connected.add(tgt);
      if (tgt === active) connected.add(src);
    });
    return connected;
  }, [selectedTerm, hoveredTerm, graphData.links]);

  // D3 force simulation
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (!svg.node() || graphData.nodes.length === 0) return;

    svg.selectAll('*').remove();

    const { width, height } = dimensions;

    // Deep copy nodes/links for d3 mutation
    const nodes: GraphNode[] = graphData.nodes.map(d => ({ ...d }));
    const links: GraphLink[] = graphData.links.map(d => ({ ...d }));

    // Zoom group
    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    // Simulation
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links)
        .id(d => d.id)
        .distance(d => 80 / Math.sqrt((d as GraphLink).count))
        .strength(d => Math.min(0.3, (d as GraphLink).count * 0.05))
      )
      .force('charge', d3.forceManyBody().strength(-120))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => Math.sqrt((d as GraphNode).count) * 4 + 16))
      .force('x', d3.forceX(width / 2).strength(0.03))
      .force('y', d3.forceY(height / 2).strength(0.03));

    simulationRef.current = simulation;

    // Links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#333')
      .attr('stroke-width', d => Math.min(d.count * 0.5 + 0.5, 3))
      .attr('stroke-opacity', d => Math.min(0.15 + d.count * 0.05, 0.5));

    // Node groups
    const node = g.append('g')
      .selectAll<SVGGElement, GraphNode>('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    // Node circle — small dot as connection point
    node.append('circle')
      .attr('r', d => Math.sqrt(d.count) * 2 + 2)
      .attr('fill', '#e8e8e8')
      .attr('stroke', 'none');

    // Node label
    node.append('text')
      .text(d => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', d => -(Math.sqrt(d.count) * 2 + 6))
      .attr('fill', '#b0b0b0')
      .attr('font-size', d => d.count > 5 ? '11px' : '9px')
      .attr('font-family', "'IBM Plex Mono', monospace")
      .attr('font-weight', d => d.count > 5 ? 'bold' : 'normal')
      .attr('pointer-events', 'none');

    // Hover and click handlers
    node.on('mouseenter', function(event, d) {
      setHoveredTerm(d.id);
      // Highlight connected
      const connected = new Set<string>();
      connected.add(d.id);
      links.forEach(l => {
        const src = typeof l.source === 'object' ? l.source.id : l.source;
        const tgt = typeof l.target === 'object' ? l.target.id : l.target;
        if (src === d.id) connected.add(tgt);
        if (tgt === d.id) connected.add(src);
      });

      node.select('circle')
        .attr('fill', n => connected.has(n.id) ? '#e8e8e8' : '#333');
      node.select('text')
        .attr('fill', n => connected.has(n.id) ? '#e8e8e8' : '#333');

      link
        .attr('stroke', l => {
          const src = typeof l.source === 'object' ? l.source.id : l.source;
          const tgt = typeof l.target === 'object' ? l.target.id : l.target;
          return (src === d.id || tgt === d.id) ? '#808080' : '#1a1a1a';
        })
        .attr('stroke-opacity', l => {
          const src = typeof l.source === 'object' ? l.source.id : l.source;
          const tgt = typeof l.target === 'object' ? l.target.id : l.target;
          return (src === d.id || tgt === d.id) ? 0.8 : 0.05;
        })
        .attr('stroke-width', l => {
          const src = typeof l.source === 'object' ? l.source.id : l.source;
          const tgt = typeof l.target === 'object' ? l.target.id : l.target;
          return (src === d.id || tgt === d.id) ? Math.min(l.count + 1, 4) : 0.5;
        });
    });

    node.on('mouseleave', function() {
      setHoveredTerm(null);
      node.select('circle').attr('fill', '#e8e8e8');
      node.select('text').attr('fill', '#b0b0b0');
      link
        .attr('stroke', '#333')
        .attr('stroke-width', d => Math.min(d.count * 0.5 + 0.5, 3))
        .attr('stroke-opacity', d => Math.min(0.15 + d.count * 0.05, 0.5));
    });

    node.on('click', function(event, d) {
      event.stopPropagation();
      setSelectedTerm(prev => prev === d.id ? null : d.id);
    });

    // Click background to deselect
    svg.on('click', () => setSelectedTerm(null));

    // Tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x!)
        .attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!)
        .attr('y2', d => (d.target as GraphNode).y!);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [graphData, dimensions]);

  return (
    <div className="flex-1 bg-bx-black overflow-hidden flex flex-col">
      {/* Graph */}
      <div ref={containerRef} className="flex-1 min-h-0 relative schematic-grid">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full"
        />

        {/* Stats overlay — top left */}
        <div className="absolute top-3 left-3 bg-bx-surface border border-bx-trace p-3 text-xs font-mono space-y-1">
          <div className="text-bx-gray-400">
            <span className="text-bx-white font-bold">{graphData.nodes.length}</span> terms
          </div>
          <div className="text-bx-gray-400">
            <span className="text-bx-white font-bold">{graphData.links.length}</span> connections
          </div>
          <div className="text-bx-gray-400">
            <span className="text-bx-white font-bold">{schematics.length}</span> schematics
          </div>
        </div>

        {/* Hover/selection info — top right */}
        {(selectedTerm || hoveredTerm) && (
          <div className="absolute top-3 right-3 bg-bx-surface border border-bx-trace p-3 text-xs font-mono max-w-xs">
            {(() => {
              const termId = selectedTerm || hoveredTerm;
              const term = terms.find(t => t.id === termId);
              if (!term) return null;
              const count = graphData.nodes.find(n => n.id === termId)?.count || 0;
              return (
                <>
                  <div className="text-bx-white font-bold text-sm">{term.abbreviation}</div>
                  <div className="text-bx-gray-300 mt-0.5">{term.expansion}</div>
                  <div className="text-bx-gray-500 mt-1">{term.definition}</div>
                  <div className="text-bx-gray-400 mt-2 border-t border-bx-trace pt-2">
                    Appears in <span className="text-bx-white">{count}</span> schematics
                    {' | '}{term.category}{' | '}Vol {term.volume}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Related schematics panel — shown when a term is selected */}
      {selectedTerm && relatedSchematics.length > 0 && (
        <div className="border-t border-bx-trace bg-bx-surface p-3 max-h-40 overflow-y-auto">
          <h3 className="text-xs font-mono font-bold text-bx-gray-400 mb-2 tracking-widest">
            SCHEMATICS CONTAINING {terms.find(t => t.id === selectedTerm)?.abbreviation || selectedTerm.toUpperCase()}
          </h3>
          <div className="flex flex-wrap gap-2">
            {relatedSchematics.map(s => (
              <button
                key={s.id}
                onClick={() => onSelectSchematic(s)}
                className={`px-2 py-1 border text-xs font-mono transition-colors ${
                  selectedSchematic?.id === s.id
                    ? 'border-bx-gray-300 text-bx-white bg-bx-surface-alt'
                    : 'border-bx-trace text-bx-gray-400 hover:border-bx-gray-500 hover:text-bx-gray-300'
                }`}
              >
                <span className="font-bold">{s.subject}</span>
                <span className="text-bx-gray-500 ml-1.5">V{s.volume}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
