'use client';

import { useState, useRef, useCallback } from 'react';
import { Schematic } from '@/types';
import { layoutBraxtonianSchematic, getNodeStyle, getEdgeStyle } from '@/lib/services/braxtonLayout';
import { terms } from '@/data/schematics-full';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface BraxtonRendererProps {
  schematic: Schematic;
  width?: number;
  height?: number;
}

export default function BraxtonRenderer({
  schematic,
  width = 800,
  height = 600,
}: BraxtonRendererProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [tooltip, setTooltip] = useState<{ x: number; y: number; term: typeof terms[0] } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Generate layout
  const layout = layoutBraxtonianSchematic(schematic);

  // Compute bounding box from actual node positions
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const node of layout.nodes) {
    minX = Math.min(minX, node.x - node.width / 2);
    minY = Math.min(minY, node.y - node.height / 2 - 20);
    maxX = Math.max(maxX, node.x + node.width / 2);
    maxY = Math.max(maxY, node.y + node.height / 2 + 20);
  }

  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;
  const padding = 60;

  // Base scale: fit content into container
  const baseScaleX = (width - padding * 2) / contentWidth;
  const baseScaleY = (height - padding * 2) / contentHeight;
  const baseScale = Math.min(baseScaleX, baseScaleY, 1.5);

  const scale = baseScale * zoom;

  const scaledW = contentWidth * scale;
  const scaledH = contentHeight * scale;
  const offsetX = (width - scaledW) / 2 - minX * scale;
  const offsetY = (height - scaledH) / 2 - minY * scale;

  const handleZoomIn = useCallback(() => setZoom(z => Math.min(z * 1.3, 5)), []);
  const handleZoomOut = useCallback(() => setZoom(z => Math.max(z / 1.3, 0.2)), []);
  const handleFit = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // left click only
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [dragging, dragStart]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom(z => Math.min(z * 1.1, 5));
    } else {
      setZoom(z => Math.max(z / 1.1, 0.2));
    }
  }, []);

  const handleNodeHover = useCallback((nodeId: string, screenX: number, screenY: number) => {
    const term = terms.find(t => t.id === nodeId);
    if (term) {
      setTooltip({ x: screenX, y: screenY, term });
    }
  }, []);

  const handleNodeLeave = useCallback(() => setTooltip(null), []);

  return (
    <div className="relative" style={{ width, height }}>
      {/* Zoom controls */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <button onClick={handleZoomIn} className="p-1.5 bg-bx-surface border border-bx-trace text-bx-gray-400 hover:text-bx-green hover:border-bx-green transition-colors" title="Zoom in">
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button onClick={handleZoomOut} className="p-1.5 bg-bx-surface border border-bx-trace text-bx-gray-400 hover:text-bx-green hover:border-bx-green transition-colors" title="Zoom out">
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button onClick={handleFit} className="p-1.5 bg-bx-surface border border-bx-trace text-bx-gray-400 hover:text-bx-green hover:border-bx-green transition-colors" title="Fit to view">
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <span className="px-2 py-1 bg-bx-surface border border-bx-trace text-bx-gray-500 text-xs font-mono">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="bg-bx-black"
        style={{ cursor: dragging ? 'grabbing' : 'grab' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#e8e8e8" />
          </marker>
          <marker id="arrow-subject" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#e8e8e8" />
          </marker>
        </defs>

        {/* Title */}
        <text x={width / 2} y={20} textAnchor="middle" fill="#b0b0b0" fontSize="12" fontFamily="'IBM Plex Mono', monospace" fontWeight="bold">
          {schematic.title}
        </text>

        {/* Diagram content */}
        <g transform={`translate(${offsetX + pan.x}, ${offsetY + pan.y}) scale(${scale})`}>
          {/* Edges */}
          {layout.edges.map((edge, i) => {
            const fromNode = layout.nodes.find(n => n.id === edge.from);
            const toNode = layout.nodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;

            // LR flow: exit right, enter left
            const startX = fromNode.x + fromNode.width / 2;
            const startY = fromNode.y;
            const endX = toNode.x - toNode.width / 2;
            const endY = toNode.y;

            const style = getEdgeStyle(edge.type);

            return (
              <g key={i}>
                <line
                  x1={startX} y1={startY}
                  x2={endX} y2={endY}
                  stroke={style.stroke}
                  strokeWidth={style.strokeWidth}
                  strokeDasharray={style.strokeDasharray}
                  strokeOpacity={style.strokeOpacity}
                  markerEnd={toNode.isSubject ? "url(#arrow-subject)" : undefined}
                />
                {toNode.isSubject && (
                  <circle cx={endX} cy={endY} r={4} fill="#e8e8e8" />
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {layout.nodes.map((node) => {
            const term = terms.find(t => t.id === node.id);
            const style = getNodeStyle({
              termId: node.id,
              isSubject: node.isSubject,
              prefix: node.prefix,
            } as any);

            return (
              <g
                key={node.id}
                transform={`translate(${node.x - node.width / 2}, ${node.y - node.height / 2})`}
                className="cursor-pointer"
                onMouseEnter={(e) => handleNodeHover(node.id, e.clientX, e.clientY)}
                onMouseMove={(e) => handleNodeHover(node.id, e.clientX, e.clientY)}
                onMouseLeave={handleNodeLeave}
              >
                {/* Node rect */}
                <rect
                  width={node.width}
                  height={node.height}
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth={style.strokeWidth}
                />

                {/* Prefix indicator */}
                {node.prefix && (
                  <text x={6} y={12} fill="#808080" fontSize="9" fontFamily="'IBM Plex Mono', monospace">
                    {node.prefix}
                  </text>
                )}

                {/* Main label */}
                <text
                  x={node.width / 2}
                  y={node.height / 2 + 4}
                  textAnchor="middle"
                  fill={node.isSubject ? '#e8e8e8' : '#b0b0b0'}
                  fontSize="11"
                  fontFamily="'IBM Plex Mono', monospace"
                  fontWeight={node.isSubject ? 'bold' : 'normal'}
                >
                  {term?.abbreviation || node.id}
                </text>

                {/* Expansion text below subject nodes */}
                {node.isSubject && term?.expansion && (
                  <text
                    x={node.width / 2}
                    y={node.height + 13}
                    textAnchor="middle"
                    fill="#555555"
                    fontSize="9"
                    fontFamily="'IBM Plex Mono', monospace"
                  >
                    {term.expansion.length > 24 ? term.expansion.substring(0, 24) + '...' : term.expansion}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Tooltip with term definition */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none px-3 py-2 bg-bx-surface border border-bx-trace-light text-xs font-mono max-w-xs"
          style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
        >
          <div className="text-bx-white font-bold">{tooltip.term.abbreviation}</div>
          <div className="text-bx-gray-300 mt-0.5">{tooltip.term.expansion}</div>
          {tooltip.term.definition && (
            <div className="text-bx-gray-400 mt-1 leading-relaxed">{tooltip.term.definition}</div>
          )}
          <div className="text-bx-gray-500 mt-1">Vol {tooltip.term.volume} | {tooltip.term.category}</div>
        </div>
      )}
    </div>
  );
}
