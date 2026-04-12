'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Schematic } from '@/types';

interface TreeViewProps {
  schematics: Schematic[];
  selectedSchematic: Schematic | null;
  onSelectSchematic: (schematic: Schematic) => void;
}

export default function TreeView({ 
  schematics, 
  selectedSchematic, 
  onSelectSchematic 
}: TreeViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !selectedSchematic) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 800;
    const height = 600;
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };

    svg.attr('width', width).attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Draw title
    g.append('text')
      .attr('x', (width - margin.left - margin.right) / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-lg font-bold fill-white')
      .text(selectedSchematic.title);

    // Simple tree visualization
    const subjectX = (width - margin.left - margin.right) / 2;
    const subjectY = 80;

    // Draw subject node (with arrow indicator)
    const subjectGroup = g.append('g')
      .attr('transform', `translate(${subjectX}, ${subjectY})`);

    // Arrow pointing to subject
    subjectGroup.append('path')
      .attr('d', 'M-30,-10 L-10,0 L-30,10')
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2);

    // Subject circle
    subjectGroup.append('circle')
      .attr('r', 25)
      .attr('fill', '#1e40af')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 3);

    // Subject label
    subjectGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .attr('class', 'text-sm font-bold fill-white')
      .text(selectedSchematic.subject);

    // Draw branches
    const branchY = subjectY + 100;
    const branchSpacing = 150;
    const startX = subjectX - ((selectedSchematic.terms.length - 1) * branchSpacing) / 2;

    selectedSchematic.terms.forEach((term, i) => {
      if (term.isSubject) return;

      const branchX = startX + i * branchSpacing;

      // Draw line from subject to branch
      g.append('line')
        .attr('x1', subjectX)
        .attr('y1', subjectY + 25)
        .attr('x2', branchX)
        .attr('y2', branchY)
        .attr('stroke', '#6b7280')
        .attr('stroke-width', selectedSchematic.relationships[i]?.type === 'thick' ? 3 : 1)
        .attr('stroke-dasharray', selectedSchematic.relationships[i]?.type === 'dashed' ? '5,5' : 'none');

      // Draw branch node
      g.append('circle')
        .attr('cx', branchX)
        .attr('cy', branchY)
        .attr('r', 20)
        .attr('fill', '#374151')
        .attr('stroke', '#6b7280')
        .attr('stroke-width', 2);

      // Branch label
      g.append('text')
        .attr('x', branchX)
        .attr('y', branchY + 5)
        .attr('text-anchor', 'middle')
        .attr('class', 'text-xs fill-white')
        .text(term.termId.split('-')[0].toUpperCase());

      // Full term below
      g.append('text')
        .attr('x', branchX)
        .attr('y', branchY + 40)
        .attr('text-anchor', 'middle')
        .attr('class', 'text-xs fill-gray-400')
        .text(term.termId);
    });

  }, [selectedSchematic]);

  if (!selectedSchematic) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-950 text-gray-400">
        <div className="text-center">
          <p className="text-lg mb-2">Select a schematic to view</p>
          <p className="text-sm">Choose from the list or search above</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-950 overflow-auto">
      <div className="p-6">
        <svg ref={svgRef} className="mx-auto" />
        
        {/* Schematic Info Panel */}
        <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-2">
            {selectedSchematic.title}
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            {selectedSchematic.description}
          </p>
          <div className="flex gap-4 text-sm">
            <span className="text-blue-400">
              Volume {selectedSchematic.volume}
            </span>
            <span className="text-gray-500">
              {selectedSchematic.section}
            </span>
            <span className="text-gray-500">
              Page {selectedSchematic.page}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
