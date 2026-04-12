import dagre from 'dagre';
import { Schematic, SchematicTerm, Relationship } from '@/types';

export interface LayoutNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isSubject?: boolean;
  prefix?: string;
}

export interface LayoutEdge {
  from: string;
  to: string;
  type: 'solid' | 'dashed' | 'thick';
  points?: { x: number; y: number }[];
}

export interface BraxtonLayout {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  width: number;
  height: number;
}

// Braxtonian visual configuration
// Schematics flow horizontally/diagonally — LR is the default rank direction.
const BRAXTON_CONFIG = {
  nodeWidth: 110,
  nodeHeight: 40,
  subjectNodeWidth: 130,
  subjectNodeHeight: 50,

  // Spacing — wider ranksep for horizontal spread, tight nodesep for diagonal feel
  spacing: {
    tree:          { ranksep: 140, nodesep: 50 },
    crossing:      { ranksep: 160, nodesep: 60 },
    'angled-tree': { ranksep: 130, nodesep: 45 },
    network:       { ranksep: 150, nodesep: 55 },
    horizontal:    { ranksep: 140, nodesep: 50 },
    'hub-spoke':   { ranksep: 140, nodesep: 50 },
  },

  // Line type visual weights (affects layout prominence)
  lineWeights: {
    thick: 10,
    solid: 5,
    dashed: 2,
  },
};

/**
 * Layout a Braxtonian schematic using Dagre with custom constraints
 */
export function layoutBraxtonianSchematic(schematic: Schematic): BraxtonLayout {
  const g = new dagre.graphlib.Graph({
    directed: true,
    compound: false,
    multigraph: false,
  });
  
  const config = BRAXTON_CONFIG.spacing[schematic.type] || BRAXTON_CONFIG.spacing.tree;
  
  // Set graph configuration
  g.setGraph({
    rankdir: getRankDirection(schematic.type),
    ranksep: config.ranksep,
    nodesep: config.nodesep,
    marginx: 50,
    marginy: 50,
    // Don't minimize crossings - preserve intentional crossings
    acyclicer: schematic.type === 'crossing' ? undefined : 'greedy',
    ranker: 'network-simplex',
  });
  
  // Set default edge label
  g.setDefaultEdgeLabel(() => ({}));
  
  // Add nodes
  schematic.terms.forEach((term) => {
    const isSubject = term.isSubject;
    g.setNode(term.termId, {
      label: term.termId,
      width: isSubject ? BRAXTON_CONFIG.subjectNodeWidth : BRAXTON_CONFIG.nodeWidth,
      height: isSubject ? BRAXTON_CONFIG.subjectNodeHeight : BRAXTON_CONFIG.nodeHeight,
      isSubject: isSubject,
      prefix: term.prefix,
    });
  });
  
  // Add edges with Braxtonian weights
  schematic.relationships.forEach((rel) => {
    g.setEdge(rel.from, rel.to, {
      weight: BRAXTON_CONFIG.lineWeights[rel.type],
      minlen: rel.type === 'dashed' ? 2 : 1, // Dashed lines span more ranks
      type: rel.type,
    });
  });
  
  // Apply custom subject positioning constraints before layout
  applySubjectConstraints(g, schematic);
  
  // Run layout
  dagre.layout(g);
  
  // Extract results
  const nodes: LayoutNode[] = schematic.terms.map((term) => {
    const node = g.node(term.termId);
    return {
      id: term.termId,
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      isSubject: term.isSubject,
      prefix: term.prefix,
    };
  });
  
  const edges: LayoutEdge[] = schematic.relationships.map((rel) => {
    const edge = g.edge(rel.from, rel.to);
    return {
      from: rel.from,
      to: rel.to,
      type: rel.type,
      points: edge?.points,
    };
  });
  
  // Calculate graph dimensions
  const graph = g.graph();
  
  return {
    nodes,
    edges,
    width: graph.width || 800,
    height: graph.height || 600,
  };
}

/**
 * Get rank direction based on schematic type.
 * Default is LR (left-to-right) — Braxton's schematics flow horizontally
 * with diagonal connections between nodes.
 */
function getRankDirection(type: string): 'TB' | 'BT' | 'LR' | 'RL' {
  switch (type) {
    case 'tree':
      return 'LR';
    case 'crossing':
      return 'LR';
    case 'angled-tree':
      return 'LR';
    case 'horizontal':
      return 'LR';
    case 'network':
      return 'LR';
    default:
      return 'LR';
  }
}

/**
 * Apply subject positioning constraints.
 * In horizontal (LR) flow the subject sits on the left side,
 * vertically centered — other terms fan out to the right diagonally.
 */
function applySubjectConstraints(g: dagre.graphlib.Graph, schematic: Schematic) {
  const subjectTerm = schematic.terms.find(t => t.isSubject);
  if (!subjectTerm) return;

  const graphWidth = 800;
  const graphHeight = 600;

  // Subject always starts at left-center for LR flow
  const subjectX = 80;
  const subjectY = graphHeight / 2;

  const node = g.node(subjectTerm.termId);
  if (node) {
    (node as any).x = subjectX;
    (node as any).y = subjectY;
  }
}

/**
 * Batch layout multiple schematics
 */
export function layoutSchematics(schematics: Schematic[]): Map<string, BraxtonLayout> {
  const layouts = new Map<string, BraxtonLayout>();
  
  schematics.forEach((schematic) => {
    try {
      const layout = layoutBraxtonianSchematic(schematic);
      layouts.set(schematic.id, layout);
    } catch (error) {
      console.error(`Failed to layout schematic ${schematic.id}:`, error);
    }
  });
  
  return layouts;
}

/**
 * Visual styling for line types
 */
export const lineStyles: Record<string, { strokeWidth: number; stroke: string; strokeOpacity: number; strokeDasharray?: string }> = {
  thick: {
    strokeWidth: 3,
    stroke: '#ffffff',
    strokeOpacity: 1,
  },
  solid: {
    strokeWidth: 1.5,
    stroke: '#9ca3af',
    strokeOpacity: 0.8,
  },
  dashed: {
    strokeWidth: 1.5,
    stroke: '#6b7280',
    strokeDasharray: '8, 4',
    strokeOpacity: 0.6,
  },
};

/**
 * Node styling based on prefix
 */
export const nodeStyles = {
  default: {
    fill: '#1f2937',
    stroke: '#4b5563',
    strokeWidth: 2,
  },
  subject: {
    fill: '#1e3a5f',
    stroke: '#3b82f6',
    strokeWidth: 3,
  },
  // Prefix-based styling
  '(c)': {
    fill: '#1e3a5f',
    stroke: '#3b82f6', // Blue for composite
    strokeWidth: 2,
  },
  '(r)': {
    fill: '#3f1f1f',
    stroke: '#ef4444', // Red for reality
    strokeWidth: 2,
  },
  '[R]': {
    fill: '#4a3f1f',
    stroke: '#eab308', // Gold for emphasized Reality
    strokeWidth: 3,
  },
  '(p)': {
    fill: '#1f3f1f',
    stroke: '#10b981', // Green for particular
    strokeWidth: 2,
  },
};

export function getNodeStyle(term: SchematicTerm) {
  if (term.isSubject) {
    return nodeStyles.subject;
  }
  
  if (term.prefix && (nodeStyles as Record<string, typeof nodeStyles.default>)[term.prefix]) {
    return (nodeStyles as Record<string, typeof nodeStyles.default>)[term.prefix];
  }
  
  return nodeStyles.default;
}

export function getEdgeStyle(type: string) {
  return lineStyles[type] || lineStyles.solid;
}
