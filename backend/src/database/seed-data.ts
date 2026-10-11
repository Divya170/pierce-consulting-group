/**
 * Launch content — copied verbatim from the design comp
 * (design-source/Pierce Consulting Group v2.dc.html). Seeded once, idempotently.
 */
import type { ArticleBlock } from '../insights/insight.entity';

export const SERVICES_SEED = [
  {
    slug: 'strategy', title: 'Business Strategy', kicker: 'DIRECTION', status: 'published' as const, visual: 'matrix' as const, sortOrder: 1,
    summary: 'Strategic priorities, business direction, and decision support for leadership teams weighing where to focus next.',
    purpose: 'Clarify business direction and the priorities that should shape it.',
    body: 'For leadership teams weighing where to focus next. We work through objectives, competing priorities, and the decisions in front of you, so that direction is explicit and shared across the business.',
    focusAreas: ['Objective setting', 'Strategic alignment', 'Decision frameworks', 'Prioritization'],
    ctaLabel: 'Discuss Business Strategy',
  },
  {
    slug: 'operations', title: 'Operational Improvement', kicker: 'EXECUTION', status: 'published' as const, visual: 'workflow' as const, sortOrder: 2,
    summary: 'Operational challenges, workflow efficiency, and opportunities to improve execution.',
    purpose: 'Explore operational challenges and where execution could improve.',
    body: 'For organizations where work is slower, costlier, or harder to coordinate than it should be. We look at how work actually moves, where it stalls, and which changes are practical to make.',
    focusAreas: ['Workflow analysis', 'Operational bottlenecks', 'Resource coordination', 'Process efficiency'],
    ctaLabel: 'Discuss Operational Improvement',
  },
  {
    slug: 'process', title: 'Process Consulting', kicker: 'PROCESS', status: 'published' as const, visual: 'before-after' as const, sortOrder: 3,
    summary: 'Process assessment, workflow clarity, and improvement planning.',
    purpose: 'Review processes and identify opportunities for greater clarity and consistency.',
    body: 'For teams whose processes have grown by accumulation rather than design. We map the current state, examine handoffs, and plan improvements the team can sustain.',
    focusAreas: ['Process mapping', 'Workflow assessment', 'Handoffs', 'Improvement planning'],
    ctaLabel: 'Discuss Process Consulting',
  },
  {
    // In the comp as status "awaiting-confirmation" with no copy — kept unpublished until the business confirms it
    slug: 'growth', title: 'Growth Planning', kicker: 'GROWTH', status: 'awaiting-confirmation' as const, visual: 'none' as const, sortOrder: 4,
    summary: '', purpose: '', body: '', focusAreas: [] as string[], ctaLabel: 'Discuss Growth Planning',
  },
];

export const CONTENT_SEED: Record<string, Record<string, unknown>[]> = {
  'hero-focus': [
    { tab: 'Direction', service: 'strategy', questions: ['Which priorities deserve resources now?', 'Which decision is being deferred, and why?', 'How will progress be judged?'] },
    { tab: 'Execution', service: 'operations', questions: ['Where does work wait the longest?', 'Which constraints are structural, and which are habits?', 'What would be practical to change first?'] },
    { tab: 'Process', service: 'process', questions: ['Where do handoffs break down?', 'Which steps add review but not value?', 'What would a deliberately designed process look like?'] },
  ],
  ticker: ['Business Strategy', 'Operational Improvement', 'Process Consulting', 'Decision Support', 'Workflow Clarity', 'Practical Next Steps'].map((label) => ({ label })),
  principle: [
    { title: 'Understand the challenge.', text: 'Begin with the situation as it actually is, including the constraints that shape it.', icon: '○' },
    { title: 'Identify practical opportunities.', text: 'Separate what would help most from what is merely possible.', icon: '◇' },
    { title: 'Define a clear path forward.', text: 'Agree on priorities, ownership, and the next concrete steps.', icon: '→' },
  ],
  challenge: [
    { title: 'Unclear strategic priorities', service: 'strategy', desc: 'Several initiatives compete for attention, and it is not obvious which deserve the organization’s time, people, and budget.' },
    { title: 'Operational bottlenecks', service: 'operations', desc: 'Work regularly queues at the same points, and delays in one area ripple into others.' },
    { title: 'Inconsistent or complicated workflows', service: 'process', desc: 'The same task is done differently by different people, or passes through more steps and approvals than it needs.' },
    { title: 'Turning objectives into practical action', service: 'strategy', desc: 'Goals are agreed at leadership level, but translating them into specific, owned actions has proven difficult.' },
    { title: 'Uncertainty about the next stage of planning', service: 'strategy', desc: 'The business is approaching a new stage, and leadership wants a clearer basis for planning it.' },
  ],
  audience: [
    { title: 'Business owners & founders', note: 'Weighing direction, structure, or the next stage.' },
    { title: 'Executive & leadership teams', note: 'Aligning on priorities and decisions.' },
    { title: 'Operations leaders', note: 'Looking at how work moves and where it stalls.' },
    { title: 'Organizations reviewing processes', note: 'Seeking clarity and consistency in how work is done.' },
  ],
  stage: [
    { title: 'Initial Conversation', short: 'Understand the business context and the challenge.', points: ['Understand the context, objectives, and main concern.', 'Clarify whether our services may be relevant.'] },
    { title: 'Discovery', short: 'Clarify priorities, objectives, and relevant constraints.', points: ['Explore the current situation, constraints, and desired direction.', 'Identify the information needed for a useful assessment.'] },
    { title: 'Recommendations', short: 'Discuss potential approaches and practical next steps.', points: ['Discuss potential options, priorities, and improvement opportunities within the agreed scope.'] },
    { title: 'Engagement Planning', short: 'Agree on scope, responsibilities, and the next stage of work.', points: ['Clarify proposed scope, deliverables, responsibilities, and next steps.'] },
  ],
  'matrix-item': [
    { code: 'A', x: 24, y: 22, note: 'Higher impact, lower effort — a natural candidate to prioritize.' },
    { code: 'B', x: 72, y: 28, note: 'Higher impact, higher effort — worth planning deliberately.' },
    { code: 'C', x: 30, y: 70, note: 'Lower impact, lower effort — useful if capacity allows.' },
    { code: 'D', x: 76, y: 76, note: 'Lower impact, higher effort — question whether to pursue it.' },
    { code: 'E', x: 46, y: 42, note: 'Close to the middle — needs a clearer view of its value before deciding.' },
  ],
  'ops-node': [
    { code: 'A', label: 'Intake', note: 'Where requests enter. Are they complete and clear enough to act on?' },
    { code: 'B', label: 'Coordination', note: 'Where work changes hands. Does it wait for decisions or information?' },
    { code: 'C', label: 'Delivery', note: 'Where the work is done. Are people and resources matched to demand?' },
    { code: 'D', label: 'Review', note: 'Where quality is checked. Does review regularly trigger rework?' },
  ],
  'process-before': [
    { label: 'Request received', note: '', indent: 0 },
    { label: 'Informal check', note: '← owner?', indent: 40 },
    { label: 'Approval', note: '', indent: 12 },
    { label: 'Rework', note: '↺ loop', indent: 64 },
    { label: 'Second approval', note: 'handoff unclear', indent: 24 },
  ],
  'process-after': [
    { label: 'Request received', owner: 'TEAM A' },
    { label: 'Defined review', owner: 'TEAM A' },
    { label: 'Single approval', owner: 'LEAD' },
    { label: 'Delivery', owner: 'TEAM B' },
  ],
  'industry-area': [
    { label: 'Market & customers', questions: ['How is demand changing in your sector?', 'Which customer expectations are hardest to meet?', 'Where are competitors setting the pace?'] },
    { label: 'Operations', questions: ['Which sector-specific constraints shape how work is delivered?', 'Where does capacity fall short of demand?', 'Which costs are hardest to control?'] },
    { label: 'People & structure', questions: ['How are decisions made, and by whom?', 'Where do responsibilities overlap or fall between roles?', 'What does leadership need to see more clearly?'] },
    { label: 'Process', questions: ['Which steps are fixed by regulation or industry practice?', 'Which steps have simply accumulated over time?', 'Where does the process differ from team to team?'] },
  ],
  'cross-challenge': [
    { title: 'Process complexity', text: 'Processes that have become harder to follow, maintain, or explain as the business has grown.', service: 'process' },
    { title: 'Operational coordination', text: 'Teams that depend on each other but lack a shared view of how work should flow between them.', service: 'operations' },
    { title: 'Strategic prioritization', text: 'More worthwhile options than the organization can pursue at once, and no agreed basis for choosing.', service: 'strategy' },
  ],
  'approach-principle': [
    { title: 'Understand before recommending.', text: 'Recommendations are only as useful as the understanding behind them.', mark: 'circle' },
    { title: 'Focus on the actual business challenge.', text: 'Keep attention on the problem you need solved, not on a predefined method.', mark: 'wide' },
    { title: 'Make priorities and assumptions explicit.', text: 'State what matters most, and what is being assumed, so both can be examined.', mark: 'tall' },
    { title: 'Define practical next steps.', text: 'Conclude with actions that are specific, owned, and achievable.', mark: 'square' },
  ],
  expectation: ['Clear communication throughout.', 'Defined objectives for the work.', 'Transparent discussion of scope.', 'Agreed next steps at each stage.', 'Appropriate handling of business information.'].map((text) => ({ text })),
  faq: [
    { question: 'What happens during an initial consultation?', answer: 'It is a conversation about your business, the challenge you would like to discuss, and what you hope to achieve. It helps both sides understand whether our services are relevant and what a sensible next step would be.' },
    { question: 'Which business challenges can I discuss?', answer: 'Questions of strategic direction, operational performance, and process design are the focus of our services. If you are unsure whether your situation fits, describe it in the form and select “Other / Not sure yet.”' },
    { question: 'How is the scope of a consulting engagement determined?', answer: 'Scope is agreed with you, based on what is learned during the initial conversation and discovery. Deliverables, responsibilities, and commercial terms are discussed individually for each engagement.' },
    { question: 'What information should I prepare?', answer: 'A short description of the situation, what you have already tried, and what a good outcome would look like is enough to begin. Please avoid sending confidential documents through the form.' },
    { question: 'Does every enquiry lead to an engagement?', answer: 'No. Some conversations conclude that another kind of support would be more appropriate, or that no engagement is needed. Either way, we aim to be clear about it.' },
  ],
  'next-step': [
    { text: 'Share some context about your business and the challenge.' },
    { text: 'We review your enquiry and reply using your preferred method.' },
    { text: 'Where relevant, we arrange an initial conversation.' },
  ],
};

/** Template-preview samples (visible only when settings.templatePreview = true) */
export const SAMPLE_CONTENT_SEED: Record<string, Record<string, unknown>[]> = {
  industry: [
    { name: 'Industry name (sample)', desc: 'Brief description of common business challenges in this sector, approved by the business.', service: 'operations' },
    { name: 'Industry name (sample)', desc: 'A second verified entry, shown here only to preview the directory layout.', service: 'process' },
  ],
  'team-member': [
    { name: 'Verified name', role: 'CONFIRMED ROLE', bio: 'Approved professional biography appears here. Only information supplied and confirmed by the business is published.', credentials: 'Verified qualifications, if supplied.', portrait: '' },
  ],
};

const SAMPLE_BODY: ArticleBlock[] = [
  { type: 'p', text: 'Sample body text. This paragraph demonstrates the reading measure, line height, and rhythm of a published article. Replace it with approved content from the CMS.' },
  { type: 'h', text: 'A second-level heading' },
  { type: 'p', text: 'Further sample text showing how sections break up longer articles. Headings follow a logical hierarchy so that the piece remains easy to scan and navigate with assistive technology.' },
  { type: 'p', text: 'Each article closes with a related service and a consultation link, shown alongside the body on wide screens and beneath it on smaller ones.' },
];

export const SAMPLE_INSIGHTS_SEED = [
  { slug: 'framing-the-problem', category: 'Strategy', serviceSlug: 'strategy', image: '/assets/desk-planner.jpg', title: 'Framing the problem before choosing a solution', excerpt: 'Sample excerpt: why a precise problem statement tends to save more time than a fast answer.' },
  { slug: 'where-work-waits', category: 'Operations', serviceSlug: 'operations', image: '/assets/team-documents.jpg', title: 'Where work waits: looking for the queue', excerpt: 'Sample excerpt: a simple way to notice where operational delays accumulate.' },
  { slug: 'handoffs', category: 'Process', serviceSlug: 'process', image: '/assets/process-mapping.jpg', title: 'The handoff is the process', excerpt: 'Sample excerpt: why the points between teams deserve as much attention as the steps within them.' },
].map((i) => ({
  ...i,
  body: SAMPLE_BODY,
  author: 'Author (verified, if available)',
  status: 'published' as const,
  featured: false,
  isSample: true,
  publishedAt: null,
}));
