// Contents pages of Tri-Axium Writings vols. 1–3: chapter prefix, name, first page, level.
export type Level = 'front' | 'L1' | 'L2' | 'L3' | 'back';
export interface Chapter { prefix: string; name: string; start: number; level: Level }

export const lastPage: Record<1 | 2 | 3, number> = { 1: 524, 2: 581, 3: 560 };

export const chapters: Record<1 | 2 | 3, Chapter[]> = {
  1: [
    { prefix: 'Front', name: 'Preface, Introduction, Glossary Integration', start: 1, level: 'front' },
    { prefix: 'WM', name: 'World Music', start: 25, level: 'L1' },
    { prefix: 'WAM', name: 'Western Art Music', start: 59, level: 'L1' },
    { prefix: 'T(AF)M', name: 'Trans-African Music', start: 97, level: 'L1' },
    { prefix: 'UPB(II)', name: 'Underlying Philosophical Bases, Level Two', start: 139, level: 'L2' },
    { prefix: 'UPB(III)', name: 'Underlying Philosophical Bases, Questions & Answers', start: 185, level: 'L3' },
    { prefix: 'WAC', name: 'Western Art Continuance', start: 203, level: 'L1' },
    { prefix: 'CMBA', name: 'Creative Music From the Black Aesthetic', start: 245, level: 'L1' },
    { prefix: 'WI', name: 'The White Improvisor', start: 285, level: 'L1' },
    { prefix: 'PCC', name: 'The Post-Cage Continuum', start: 317, level: 'L1' },
    { prefix: 'TR(III)', name: 'Transition, Questions & Answers', start: 347, level: 'L3' },
    { prefix: 'NYM', name: 'The New York Movement', start: 367, level: 'L1' },
    { prefix: 'MID-W', name: 'The Midwest (and West Coast) Continuum', start: 407, level: 'L1' },
    { prefix: 'EXT.F(II)', name: 'Extended Functionalism, Level Two', start: 439, level: 'L2' },
    { prefix: 'EXT.F(III)', name: 'Extended Functionalism, Questions & Answers', start: 471, level: 'L3' },
    { prefix: 'Glossary', name: 'Glossary', start: 489, level: 'back' },
  ],
  2: [
    { prefix: 'Front', name: 'Preface, Introduction, Glossary Integration', start: 1, level: 'front' },
    { prefix: 'SD(SY)', name: 'The Spectacle-Diversion Syndrome', start: 25, level: 'L1' },
    { prefix: 'AF(D)', name: 'Affinity Dynamics', start: 73, level: 'L1' },
    { prefix: 'AE(PD)', name: 'Aspect Essence (Perception Dynamics)', start: 113, level: 'L1' },
    { prefix: 'SR(TRS)II', name: 'Social Reality and Trans-Information, Level Two', start: 145, level: 'L2' },
    { prefix: 'SR(TRS)III', name: 'Social Reality and Trans-Information, Questions & Answers', start: 189, level: 'L3' },
    { prefix: 'CMOA(I)', name: 'Britain, Germany, Holland', start: 207, level: 'L1' },
    { prefix: 'CMOA(II)', name: 'France, Italy, Northern Europe, Japan', start: 243, level: 'L1' },
    { prefix: 'CMOA(III)', name: 'Creative Music Outside of America, Questions & Answers', start: 299, level: 'L3' },
    { prefix: 'R(AS)CM(I)', name: 'Reality Aspect of Creative Music, Level One', start: 317, level: 'L1' },
    { prefix: 'R(AS)CM(II)', name: 'Reality Aspect of Creative Music, Level Two', start: 357, level: 'L2' },
    { prefix: 'R(AS)CM(III)', name: 'Reality Aspect of Creative Music, Questions & Answers', start: 409, level: 'L3' },
    { prefix: 'MP(I)', name: 'Music and Politics, Level One', start: 427, level: 'L1' },
    { prefix: 'MP(II)', name: 'Music and Politics, Level Two', start: 483, level: 'L2' },
    { prefix: 'MP(III)', name: 'Music and Politics, Questions & Answers', start: 529, level: 'L3' },
    { prefix: 'Glossary', name: 'Glossary', start: 549, level: 'back' },
  ],
  3: [
    { prefix: 'Front', name: 'Preface, Introduction, Glossary Integration', start: 1, level: 'front' },
    { prefix: 'BK(NM)', name: 'Black Notated Music', start: 25, level: 'L1' },
    { prefix: 'CS', name: 'Creativity and Science', start: 73, level: 'L1' },
    { prefix: 'ALT(FT)II', name: 'Alternative Functionalism, Level Two', start: 107, level: 'L2' },
    { prefix: 'ALT(FT)III', name: 'Alternative Functionalism, Questions & Answers', start: 145, level: 'L3' },
    { prefix: 'EVOL', name: 'Evolution', start: 163, level: 'L1' },
    { prefix: 'T(IMP)M', name: 'The Teaching of Improvised Music', start: 203, level: 'L1' },
    { prefix: 'PR.S(RD)II', name: 'Progressional Significance and Re-Definitions, Level Two', start: 247, level: 'L2' },
    { prefix: 'PR.S(RD)III', name: 'Progressional Significance and Re-Definitions, Questions & Answers', start: 315, level: 'L3' },
    { prefix: 'PMBA', name: 'Popular Music from the Black Aesthetic', start: 337, level: 'L1' },
    { prefix: 'JR', name: 'The Phenomenon of Jazz-Rock', start: 379, level: 'L1' },
    { prefix: 'PMBA(III)', name: 'Popular Music from the Black Aesthetic, Questions & Answers', start: 413, level: 'L3' },
    { prefix: 'TRF(CW)', name: 'The Reality of the Creative Woman', start: 429, level: 'L1' },
    { prefix: 'TRF(II)', name: 'Transformation, Level Two', start: 465, level: 'L2' },
    { prefix: 'TRF(III)', name: 'Transformation, Questions & Answers', start: 511, level: 'L3' },
    { prefix: 'Glossary', name: 'Glossary', start: 527, level: 'back' },
  ],
};

export function chapterOf(volume: 1 | 2 | 3, page: number): Chapter {
  const list = chapters[volume];
  return list.filter((c) => c.start <= page).pop() ?? list[0];
}

export function chapterEnd(volume: 1 | 2 | 3, chapter: Chapter): number {
  const list = chapters[volume];
  const next = list[list.indexOf(chapter) + 1];
  return next ? next.start - 1 : lastPage[volume];
}
