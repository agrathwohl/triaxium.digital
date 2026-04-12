// Braxtonian schematics WITHOUT hardcoded coordinates
// Coordinates are calculated automatically by the layout algorithm

import { Schematic } from '@/types';

export const schematics: Schematic[] = [
  // VOLUME 1 - World Music
  {
    id: 'v1-p20',
    volume: 1,
    section: 'WM',
    page: 20,
    subject: 'VT-DY',
    title: '[R]VT-DY relates to POST',
    type: 'tree',
    description: 'Vibrational dynamics in three contexts: source initiation, reality alignment, affinity tendencies',
    terms: [
      { termId: 'vt-dy', isSubject: true, prefix: 'R' },
      { termId: 'post' },
      { termId: 'sg' },
      { termId: 'rt-algn' },
      { termId: 'aftd' },
      { termId: 'pri-vt-td' },
      { termId: 'lang-dy' },
      { termId: 'indiv-dy' },
      { termId: 'afi' },
      { termId: 'prog-cont' },
    ],
    relationships: [
      { from: 'vt-dy', to: 'post', type: 'dashed' },
      { from: 'vt-dy', to: 'sg', type: 'solid' },
      { from: 'vt-dy', to: 'rt-algn', type: 'solid' },
      { from: 'vt-dy', to: 'aftd', type: 'solid' },
      { from: 'sg', to: 'pri-vt-td', type: 'solid' },
      { from: 'rt-algn', to: 'lang-dy', type: 'solid' },
      { from: 'aftd', to: 'indiv-dy', type: 'solid' },
      { from: 'indiv-dy', to: 'afi', type: 'solid' },
      { from: 'indiv-dy', to: 'prog-cont', type: 'dashed' },
    ],
  },
  
  // VOLUME 2 - Spectacle Diversion
  {
    id: 'v2-sd17',
    volume: 2,
    section: 'SD(SY)-17',
    page: 39,
    subject: 'SPT-DYM',
    title: 'Spectacle-Diversion Sequence',
    type: 'crossing',
    description: 'The reality and vibrational implications of American progressionalism',
    terms: [
      { termId: 'spt-dym', isSubject: true, prefix: 'c' },
      { termId: 'prog-cont' },
      { termId: 'afi' },
      { termId: 'vt-dy' },
      { termId: 'stf' },
      { termId: 'crtf-d' },
    ],
    relationships: [
      { from: 'spt-dym', to: 'prog-cont', type: 'thick' },
      { from: 'prog-cont', to: 'afi', type: 'solid' },
      { from: 'prog-cont', to: 'vt-dy', type: 'solid' },
      { from: 'spt-dym', to: 'stf', type: 'solid' },
      { from: 'spt-dym', to: 'crtf-d', type: 'solid' },
    ],
  },
  
  // VOLUME 3 - Alternative Functionalism
  {
    id: 'v3-altft14',
    volume: 3,
    section: 'ALT(FT)||-14',
    page: 120,
    subject: 'HI-P',
    title: 'High Purpose to Infra-Structure Dynamics',
    type: 'angled-tree',
    description: 'Alternative functionalism and political dynamics',
    terms: [
      { termId: 'hi-p', isSubject: true },
      { termId: 'alt-ft' },
      { termId: 'tr' },
      { termId: 'rt-dy' },
      { termId: 'pol-dy' },
      { termId: 'if-st-dy' },
      { termId: 'apl-dy' },
      { termId: 'c-hm' },
    ],
    relationships: [
      { from: 'hi-p', to: 'alt-ft', type: 'thick' },
      { from: 'alt-ft', to: 'tr', type: 'solid' },
      { from: 'hi-p', to: 'rt-dy', type: 'solid' },
      { from: 'rt-dy', to: 'pol-dy', type: 'solid' },
      { from: 'rt-dy', to: 'if-st-dy', type: 'thick' },
      { from: 'if-st-dy', to: 'apl-dy', type: 'solid' },
      { from: 'alt-ft', to: 'c-hm', type: 'solid' },
    ],
  },
];

// Export stats
export const dataStats = {
  totalSchematics: schematics.length,
  byVolume: {
    1: schematics.filter(s => s.volume === 1).length,
    2: schematics.filter(s => s.volume === 2).length,
    3: schematics.filter(s => s.volume === 3).length,
  },
};

export default { schematics, dataStats };
