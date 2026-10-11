/**
 * Registry of every generic content type. The backend validates against these
 * definitions and serves them to the admin UI, which renders forms from them.
 */

export type FieldKind = 'text' | 'textarea' | 'number' | 'list' | 'service' | 'select' | 'image';

export interface FieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  max?: number; // max chars (text) / max items (list)
  min?: number; // min value (number)
  maxValue?: number; // max value (number)
  options?: { value: string; label: string }[];
  help?: string;
}

export interface ContentTypeDef {
  type: string;
  label: string;
  page: string;
  description: string;
  /** Field shown as the row title in admin lists */
  titleField: string;
  fields: FieldDef[];
  /** Supports the "sample / template preview" flag */
  sampleable?: boolean;
}

export const CONTENT_TYPES: ContentTypeDef[] = [
  {
    type: 'hero-focus', label: 'Challenge map areas', page: 'Home — hero', titleField: 'tab',
    description: 'Tabs in the home hero "Challenge map" with three guiding questions and a related service.',
    fields: [
      { key: 'tab', label: 'Tab label', kind: 'text', required: true, max: 30 },
      { key: 'service', label: 'Related service', kind: 'service', required: true },
      { key: 'questions', label: 'Questions', kind: 'list', required: true, max: 5 },
    ],
  },
  {
    type: 'ticker', label: 'Ticker items', page: 'Home — marquee', titleField: 'label',
    description: 'Phrases scrolling in the gold band under the hero.',
    fields: [{ key: 'label', label: 'Label', kind: 'text', required: true, max: 40 }],
  },
  {
    type: 'principle', label: 'Proposition panels', page: 'Home — §01', titleField: 'title',
    description: 'Expanding panels under "A clearer view of the business in front of you."',
    fields: [
      { key: 'title', label: 'Title', kind: 'text', required: true, max: 80 },
      { key: 'text', label: 'Text', kind: 'textarea', required: true, max: 300 },
      { key: 'icon', label: 'Icon glyph', kind: 'select', required: true, options: [
        { value: '○', label: '○ Circle' }, { value: '◇', label: '◇ Diamond' }, { value: '→', label: '→ Arrow' }, { value: '□', label: '□ Square' },
      ] },
    ],
  },
  {
    type: 'challenge', label: 'Business challenges', page: 'Home — §03', titleField: 'title',
    description: 'Situations a business may recognise, each linked to the service it most often relates to.',
    fields: [
      { key: 'title', label: 'Title', kind: 'text', required: true, max: 90 },
      { key: 'desc', label: 'Description', kind: 'textarea', required: true, max: 400 },
      { key: 'service', label: 'Related service', kind: 'service', required: true },
    ],
  },
  {
    type: 'audience', label: 'Audiences', page: 'Home — §04', titleField: 'title',
    description: '"Built for the people who make the call."',
    fields: [
      { key: 'title', label: 'Title', kind: 'text', required: true, max: 80 },
      { key: 'note', label: 'Note', kind: 'text', required: true, max: 140 },
    ],
  },
  {
    type: 'stage', label: 'Engagement stages', page: 'Home §05 + Our Approach', titleField: 'title',
    description: 'The four stages of an engagement.',
    fields: [
      { key: 'title', label: 'Title', kind: 'text', required: true, max: 60 },
      { key: 'short', label: 'Short summary', kind: 'text', required: true, max: 140 },
      { key: 'points', label: 'Points', kind: 'list', required: true, max: 6 },
    ],
  },
  {
    type: 'matrix-item', label: 'Priority matrix items', page: 'Services — Business Strategy figure', titleField: 'code',
    description: 'Points on the illustrative impact / effort matrix. X and Y are percentages (0–100).',
    fields: [
      { key: 'code', label: 'Code', kind: 'text', required: true, max: 2 },
      { key: 'x', label: 'Effort (X %)', kind: 'number', required: true, min: 5, maxValue: 95 },
      { key: 'y', label: 'Impact (Y % from top)', kind: 'number', required: true, min: 5, maxValue: 95 },
      { key: 'note', label: 'Note', kind: 'text', required: true, max: 160 },
    ],
  },
  {
    type: 'ops-node', label: 'Workflow stages', page: 'Services — Operational Improvement figure', titleField: 'label',
    description: 'Stages in the illustrative "workflow — current state" schematic.',
    fields: [
      { key: 'code', label: 'Code', kind: 'text', required: true, max: 2 },
      { key: 'label', label: 'Label', kind: 'text', required: true, max: 30 },
      { key: 'note', label: 'Note', kind: 'text', required: true, max: 200 },
    ],
  },
  {
    type: 'process-before', label: 'Process — before', page: 'Services — Process Consulting figure', titleField: 'label',
    description: '"Before — accumulated" steps. Indent is in pixels (0–80).',
    fields: [
      { key: 'label', label: 'Label', kind: 'text', required: true, max: 40 },
      { key: 'note', label: 'Annotation', kind: 'text', max: 30 },
      { key: 'indent', label: 'Indent (px)', kind: 'number', min: 0, maxValue: 80 },
    ],
  },
  {
    type: 'process-after', label: 'Process — after', page: 'Services — Process Consulting figure', titleField: 'label',
    description: '"After — designed" steps with an owner.',
    fields: [
      { key: 'label', label: 'Label', kind: 'text', required: true, max: 40 },
      { key: 'owner', label: 'Owner', kind: 'text', required: true, max: 20 },
    ],
  },
  {
    type: 'industry-area', label: 'Questions by area', page: 'Industries — hero', titleField: 'label',
    description: 'Business areas with example questions an initial conversation may cover.',
    fields: [
      { key: 'label', label: 'Area', kind: 'text', required: true, max: 40 },
      { key: 'questions', label: 'Questions', kind: 'list', required: true, max: 5 },
    ],
  },
  {
    type: 'industry', label: 'Industries', page: 'Industries — directory', titleField: 'name', sampleable: true,
    description: 'Industries approved by the business. When none are published, the page shows an invitation to describe your industry.',
    fields: [
      { key: 'name', label: 'Industry name', kind: 'text', required: true, max: 80 },
      { key: 'desc', label: 'Description', kind: 'textarea', required: true, max: 400 },
      { key: 'service', label: 'Related service', kind: 'service', required: true },
    ],
  },
  {
    type: 'cross-challenge', label: 'Cross-industry challenges', page: 'Industries — general challenges', titleField: 'title',
    description: '"Questions that arise across sectors."',
    fields: [
      { key: 'title', label: 'Title', kind: 'text', required: true, max: 60 },
      { key: 'text', label: 'Text', kind: 'textarea', required: true, max: 300 },
      { key: 'service', label: 'Related service', kind: 'service', required: true },
    ],
  },
  {
    type: 'approach-principle', label: 'Working principles', page: 'Our Approach', titleField: 'title',
    description: 'Principles grid on the approach page.',
    fields: [
      { key: 'title', label: 'Title', kind: 'text', required: true, max: 80 },
      { key: 'text', label: 'Text', kind: 'textarea', required: true, max: 300 },
      { key: 'mark', label: 'Mark shape', kind: 'select', required: true, options: [
        { value: 'circle', label: 'Circle' }, { value: 'wide', label: 'Wide rectangle' }, { value: 'tall', label: 'Tall rectangle' }, { value: 'square', label: 'Square' },
      ] },
    ],
  },
  {
    type: 'expectation', label: 'Client expectations', page: 'Our Approach', titleField: 'text',
    description: '"What clients can expect" checklist.',
    fields: [{ key: 'text', label: 'Text', kind: 'text', required: true, max: 120 }],
  },
  {
    type: 'faq', label: 'FAQ', page: 'Our Approach', titleField: 'question',
    description: '"Questions before a first conversation."',
    fields: [
      { key: 'question', label: 'Question', kind: 'text', required: true, max: 160 },
      { key: 'answer', label: 'Answer', kind: 'textarea', required: true, max: 1200 },
    ],
  },
  {
    type: 'team-member', label: 'Team members', page: 'Team', titleField: 'name', sampleable: true,
    description: 'Publish only verified names, roles, biographies and approved portraits. With none published, the page shows the business contact card.',
    fields: [
      { key: 'name', label: 'Name', kind: 'text', required: true, max: 120 },
      { key: 'role', label: 'Role', kind: 'text', required: true, max: 80 },
      { key: 'bio', label: 'Biography', kind: 'textarea', required: true, max: 2000 },
      { key: 'credentials', label: 'Credentials', kind: 'text', max: 240 },
      { key: 'portrait', label: 'Portrait', kind: 'image' },
    ],
  },
  {
    type: 'next-step', label: 'Contact — next steps', page: 'Request a Consultation', titleField: 'text',
    description: 'What happens after someone submits the consultation form.',
    fields: [{ key: 'text', label: 'Text', kind: 'text', required: true, max: 160 }],
  },
];

export const CONTENT_TYPE_MAP = new Map(CONTENT_TYPES.map((t) => [t.type, t]));
