// Shannon's career, world by world. Sources: her CV (assets/CV_ShannonH.pdf on
// shannonhecker.com) and her own words in the build conversation. Keep these
// matching LinkedIn: the panel checks dates.
// Genuine C&C Inc.: 2010, Taipei. Shannon confirmed both.
export const JOURNEY = [
  { place: 'Kaohsiung', when: 'Growing up', line: 'Grew up by the sea in Kaohsiung, in the city by the park, on a motorbike most days.', href: null },
  { place: 'Ling Tung University', when: '2008 to 2010', line: 'I studied art, craft and digital media in Taiwan. BA in Digital Media Arts and Management.', href: null },
  { place: 'Genuine C&C Inc.', when: '2010', line: 'Web and visual designer, B2C.', href: null },
  { place: 'London Metropolitan University', when: '2015 to 2016', line: 'I came to the UK in 2013 for a working holiday and study. At London Met, I studied Digital Media with a focus on game and UX design.', href: null },
  { place: 'J.P. Morgan, London', when: 'June 2016 to 2025', line: 'Intern, Analyst, Senior Analyst, then Vice President. User Experience Designer, then Digital Product Designer VP. UI and visual first, then UI and UX together. Fusion at the top.', href: '/fusion' },
  { place: 'Barclays, London', when: '2025 to now', line: 'Lead Product Designer, FX and MarketsOne.', href: '/fx' },
  { place: 'Next: AI', when: '2026 to now', line: "Where I'm heading next: designing AI products. uoaui.ai is the AI-native product I design and build to get there. The model drafts, I decide.", href: '/uoaui' },
  { place: 'Winking Star', when: 'Bonus · 2026', line: 'A family routine app, designed and shipped solo on the App Store.', href: '/winking-star' },
] as const;

/** Which world each case page links to. */
export const CASE_WORLD: Record<string, number> = { '/fusion': 4, '/fx': 5, '/uoaui': 6, '/winking-star': 7 };

// Worlds group the stops so the map offers four choices, not eight: the
// stages of a world play back to back (Mario's 1-1, 1-2, 1-3), each with
// its own story card in between.
export const CHAPTERS = [
  { name: 'Taiwan', when: 'Growing up to 2010', stages: [0, 1, 2] },
  { name: 'London', when: '2013 to now', stages: [3, 4, 5] },
  { name: 'Next: AI', short: 'AI', when: '2026 to now', stages: [6] },
  { name: 'Bedtime', when: 'Bonus', stages: [7], bonus: true },
] as const;

/** Which world a stage belongs to. */
export const chapterOf = (stage: number) => CHAPTERS.findIndex((c) => (c.stages as readonly number[]).includes(stage));

/** "1-2" for a stage inside a world, "3" for a one-stage world, "Bonus" for the bonus. */
export function stageCode(stage: number) {
  const c = chapterOf(stage), ch = CHAPTERS[c];
  if ('bonus' in ch && ch.bonus) return 'Bonus';
  return ch.stages.length === 1 ? `${c + 1}` : `${c + 1}-${(ch.stages as readonly number[]).indexOf(stage) + 1}`;
}

/** The label for the end card's main button. */
export function nextLabel(stage: number) {
  const next = stage + 1;
  if (chapterOf(next) === chapterOf(stage)) return 'Next stage';
  const ch = CHAPTERS[chapterOf(next)];
  if ('bonus' in ch && ch.bonus) return `Bonus: ${ch.name}`;
  return `Next world: ${'short' in ch ? ch.short : ch.name}`;
}
