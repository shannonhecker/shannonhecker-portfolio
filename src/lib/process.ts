// Read-only source review: Revolut Portfolio 2026, Figma 17Rsi3vWFtaYwlrRf5iO8E,
// page 2068:239, 10 October 2026. Role summaries are not invented interviewees.
// Later approved case copy wins over older deck text, especially Winking Star.
export type Persona = { role: string; job: string; need: string };
export type JourneyStage = { stage: string; action: string; friction: string; response: string };
export type Decision = { question: string; chosen: string; alternative: string; reason: string };
export type Project = 'fx' | 'fusion' | 'ai' | 'winking';

export const personas: Partial<Record<Project, Persona[]>> = {
  fx: [
    { role: 'The trader', job: 'A trader who acts', need: 'Am I ahead of the market or behind it.' },
    { role: 'The desk head', job: 'A desk head who defends the result', need: 'Execution quality only means something against a benchmark or another order.' },
    { role: 'The quant', job: 'A quant who tunes the algo', need: 'Studies run on bid, ask and mid only, and the picker says why.' },
  ],
  fusion: [
    { role: 'Portfolio managers', job: 'Performance, attribution and risk they could take into a board meeting.', need: 'Their real need was trust in the numbers, not more features.' },
    { role: 'Analysts', job: 'Select a data cube. Filter and slice. Analyse returns, attribution and risk.', need: 'Report, without leaving the surface.' },
    { role: 'External clients', job: "Phase two brought in clients who'd had no training.", need: 'One product with entitlement-based views over a simplified client version.' },
  ],
  ai: [
    { role: 'Designers like me', job: 'Prompt, generate, compare, tune, export.', need: "Designing for yourself hides your blind spots. The alpha exists partly to break my own assumptions." },
    { role: 'A developer inspecting the output', job: 'The thing a developer can inspect.', need: "Built from a system's official React components." },
  ],
};

export const journeys: Partial<Record<Project, JourneyStage[]>> = {
  fx: [
    { stage: 'Monitor', action: 'A trader works a large FX order over hours.', friction: 'A static chart, five spreadsheets and a separate execution tool.', response: 'Keep the trader in one place.' },
    { stage: 'Assess', action: 'How far along is my order, and am I getting a good price.', friction: "Show them apart and the trader flicks between charts under pressure. Mash them together and it's noise.", response: 'One canvas with a dual axis.' },
    { stage: 'Step in', action: 'Drag a price line to reprice.', friction: "You can't reprice by accident.", response: 'A pre-filled ticket, confirmation and the audit trail.' },
    { stage: 'Review', action: 'A compare view, because quality is relative.', friction: 'Execution quality only means something against a benchmark or another order.', response: 'A patient working order beside an urgent completed one, with the benchmark metrics in one table.' },
  ],
  fusion: [
    { stage: 'Find the data', action: 'Select a data cube.', friction: 'Portfolio managers and analysts were drowning in fragmented data.', response: "FactSet's analytics engine behind it." },
    { stage: 'Shape the view', action: 'Filter and slice.', friction: 'The middle tier added cognitive load without changing what people built.', response: 'Cut a customisation tier.' },
    { stage: 'Analyse', action: 'Analyse returns, attribution and risk.', friction: 'Dense data and decision speed.', response: 'Modular widgets, so the same widget works across different data cubes and permission levels.' },
    { stage: 'Present', action: 'Report, without leaving the surface.', friction: 'Expert users under time pressure, often presenting the screen live.', response: 'Board-ready analytics on Salt.' },
  ],
  ai: [
    { stage: 'Describe', action: 'Describe the screen in words.', friction: "Designing for output you can't fully predict.", response: "Built from a system's official React components." },
    { stage: 'Compare', action: 'The same screen in Salt, Material, Fluent and Carbon.', friction: 'The hard part was where the systems disagree.', response: 'Five systems, one model underneath.' },
    { stage: 'Tune', action: 'Density, theme and charts. The person decides here.', friction: "The model's first answer is a draft.", response: 'The model drafts, I decide.' },
    { stage: 'Hand over', action: 'Export React.', friction: "It doesn't ship the final product and I don't claim it does.", response: 'Code a developer recognises.' },
  ],
};

export const decisions: Record<Project, Decision[]> = {
  fx: [
    { question: 'Progress and price', chosen: 'One canvas with a dual axis', alternative: 'Two linked panels', reason: 'Two panels were cleaner to build, but traders flicked between them under pressure and missed the moment. A denser screen that needed careful hierarchy.' },
    { question: 'Reprice', chosen: 'Drag-to-reprice on the price line', alternative: 'A menu-based edit', reason: 'The decision and the action sit in the same place, with a pre-filled ticket as the safety step.' },
    { question: 'Studies', chosen: 'Bid, ask and mid only', alternative: "Any series, including the order's own fills", reason: "Order data has gaps, so a study on it looks confident and is wrong." },
  ],
  fusion: [
    { question: 'Dashboard structure', chosen: 'Modular widgets', alternative: 'Fixed layouts per report type', reason: 'One widget serves many cubes and permission levels.' },
    { question: 'Configuration', chosen: 'Cut a customisation tier', alternative: 'Three levels of configuration', reason: 'The middle tier added cognitive load without changing what people built.' },
    { question: 'Phase two', chosen: 'One product with entitlement-based views', alternative: 'A simplified client version', reason: 'Patterns stayed consistent and the team kept one codebase.' },
  ],
  ai: [
    { question: 'Generation', chosen: 'Official component mappings with fallbacks', alternative: 'Letting the model draw free-form UI', reason: 'The output is something a developer recognises, at the cost of the model having fewer moves.' },
    { question: 'Switching systems', chosen: 'Five systems, one model underneath', alternative: 'A screen rebuilt by hand', reason: 'I mapped their tokens, density scales and theming into one structure.' },
    { question: 'Export', chosen: 'Compare and tune before export', alternative: "The model's first answer", reason: "That's where the person decides, and where I correct the model most often." },
  ],
  winking: [
    { question: 'Daily motivation', chosen: 'Stars and a pet', alternative: 'A plain tick list', reason: 'The checklist lost in our own house within a week.' },
    { question: 'First open', chosen: 'A sample family before any setup', alternative: 'A tour and an empty state', reason: "Both asked parents to invest before they'd seen the loop." },
    { question: 'Access and trust', chosen: 'Lifetime unlock', alternative: 'A small subscription', reason: "It's for children, and trust is the product. Free to start, one payment if you want everything, no ads, no third-party tracking." },
  ],
};
