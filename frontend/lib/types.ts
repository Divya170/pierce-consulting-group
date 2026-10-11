export interface PublicSettings {
  contactName: string;
  email: string | null;
  phone: string | null;
  mailHref: string | null;
  telHref: string | null;
  address: string | null;
  showAddress: boolean;
  heroRotate: boolean;
  templatePreview: boolean;
  privacyPolicy: string;
}

export type ServiceVisual = 'matrix' | 'workflow' | 'before-after' | 'none';

export interface PublicService {
  id: number;
  slug: string;
  num: string;
  title: string;
  kicker: string;
  summary: string;
  purpose: string;
  body: string;
  focusAreas: string[];
  visual: ServiceVisual;
  ctaLabel: string;
}

export interface SiteData {
  settings: PublicSettings;
  services: PublicService[];
}

/** Every content item carries id/num/isSample plus its type-specific fields. */
export interface ContentBase {
  id: number;
  num: string;
  isSample: boolean;
  serviceTitle?: string | null;
  serviceHref?: string;
  contactHref?: string;
}
export type HeroFocus = ContentBase & { tab: string; service: string; questions: string[] };
export type Ticker = ContentBase & { label: string };
export type Principle = ContentBase & { title: string; text: string; icon: string };
export type Challenge = ContentBase & { title: string; desc: string; service: string };
export type Audience = ContentBase & { title: string; note: string };
export type Stage = ContentBase & { title: string; short: string; points: string[] };
export type MatrixItem = ContentBase & { code: string; x: number; y: number; note: string };
export type OpsNode = ContentBase & { code: string; label: string; note: string };
export type ProcessBefore = ContentBase & { label: string; note: string; indent: number };
export type ProcessAfter = ContentBase & { label: string; owner: string };
export type IndustryArea = ContentBase & { label: string; questions: string[] };
export type Industry = ContentBase & { name: string; desc: string; service: string };
export type CrossChallenge = ContentBase & { title: string; text: string; service: string };
export type ApproachPrinciple = ContentBase & { title: string; text: string; mark: 'circle' | 'wide' | 'tall' | 'square' };
export type Expectation = ContentBase & { text: string };
export type Faq = ContentBase & { question: string; answer: string };
export type TeamMember = ContentBase & { name: string; role: string; bio: string; credentials: string; portrait: string };
export type NextStep = ContentBase & { text: string };

export interface ContentMap {
  'hero-focus': HeroFocus;
  ticker: Ticker;
  principle: Principle;
  challenge: Challenge;
  audience: Audience;
  stage: Stage;
  'matrix-item': MatrixItem;
  'ops-node': OpsNode;
  'process-before': ProcessBefore;
  'process-after': ProcessAfter;
  'industry-area': IndustryArea;
  industry: Industry;
  'cross-challenge': CrossChallenge;
  'approach-principle': ApproachPrinciple;
  expectation: Expectation;
  faq: Faq;
  'team-member': TeamMember;
  'next-step': NextStep;
}
export type ContentType = keyof ContentMap;
export type ContentBundle<K extends ContentType> = { [P in K]: ContentMap[P][] };

export interface InsightCard {
  id: number;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  image: string | null;
  featured: boolean;
  isSample: boolean;
  publishedAt: string | null;
  serviceSlug: string | null;
  serviceTitle: string | null;
  serviceHref: string;
  contactHref: string;
}

export interface InsightList {
  items: InsightCard[];
  total: number;
  totalVisible: number;
  offset: number;
  limit: number;
  categories: string[];
  hasSamples: boolean;
}

export interface ArticleBlock {
  type: 'h' | 'p';
  text: string;
}

export interface InsightArticle extends InsightCard {
  author: string | null;
  body: ArticleBlock[];
}

// ---------- admin ----------

export type InquiryStatus = 'new' | 'review' | 'contacted' | 'closed';

export interface Inquiry {
  id: string;
  reference: string;
  fullName: string;
  email: string;
  company: string;
  phone: string | null;
  serviceInterest: string;
  serviceTitle: string;
  challenge: string;
  preferredContact: 'email' | 'phone' | null;
  status: InquiryStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminService {
  id: number;
  slug: string;
  title: string;
  kicker: string;
  summary: string;
  purpose: string;
  body: string;
  focusAreas: string[];
  visual: ServiceVisual;
  ctaLabel: string;
  status: 'published' | 'draft' | 'awaiting-confirmation';
  sortOrder: number;
  updatedAt: string;
}

export interface AdminInsight {
  id: number;
  slug: string;
  title: string;
  category: string;
  serviceSlug: string | null;
  image: string | null;
  excerpt: string;
  bodyText: string;
  author: string | null;
  status: 'draft' | 'published';
  featured: boolean;
  isSample: boolean;
  publishedAt: string | null;
  updatedAt: string;
}

export type FieldKind = 'text' | 'textarea' | 'number' | 'list' | 'service' | 'select' | 'image';
export interface FieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  max?: number;
  min?: number;
  maxValue?: number;
  options?: { value: string; label: string }[];
  help?: string;
}
export interface ContentTypeDef {
  type: string;
  label: string;
  page: string;
  description: string;
  titleField: string;
  fields: FieldDef[];
  sampleable?: boolean;
}
export interface AdminContentItem {
  id: number;
  type: string;
  sortOrder: number;
  fields: Record<string, unknown>;
  published: boolean;
  isSample: boolean;
  updatedAt: string;
}

export interface AdminSettings {
  contactName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  showAddress: boolean;
  heroRotate: boolean;
  templatePreview: boolean;
  privacyPolicy: string;
  updatedAt: string;
}
