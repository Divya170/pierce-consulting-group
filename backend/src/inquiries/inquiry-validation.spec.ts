/* Dependency-free tests for the pure business rules. Run: npm run test:validation */
import assert from 'node:assert/strict';
import { errorSummary, validateInquiry } from './inquiry-validation';
import { parseArticleBody, serializeArticleBody } from '../insights/article-body';
import { validateContentFields } from '../content/content.validation';
import { CONTENT_TYPE_MAP } from '../content/content.schemas';

const services = new Set(['strategy', 'operations', 'process', 'other']);
const ok = (s: string) => services.has(s);
const good = {
  fullName: '  Ada Lovelace ',
  email: 'Ada@Example.COM ',
  company: 'Analytical Engines',
  phone: '',
  serviceInterest: 'strategy',
  challenge: 'We have too many initiatives and no agreed way to choose between them.',
  preferredContact: 'email',
};
let passed = 0;
const t = (name: string, fn: () => void) => {
  fn();
  passed++;
  console.log('  ✓', name);
};

console.log('validateInquiry');
t('accepts a valid enquiry and normalises it', () => {
  const { value, errors } = validateInquiry(good, ok);
  assert.deepEqual(errors, {});
  assert.equal(value.fullName, 'Ada Lovelace');
  assert.equal(value.email, 'ada@example.com');
  assert.equal(value.phone, null);
  assert.equal(value.preferredContact, 'email');
});
t('name rules', () => {
  assert.equal(validateInquiry({ ...good, fullName: 'A' }, ok).errors.name, 'Enter your full name.');
  assert.equal(validateInquiry({ ...good, fullName: 'x'.repeat(121) }, ok).errors.name, 'Use 120 characters or fewer.');
});
t('email rules', () => {
  assert.equal(validateInquiry({ ...good, email: '' }, ok).errors.email, 'Enter your business email.');
  assert.equal(validateInquiry({ ...good, email: 'a@b.c' }, ok).errors.email, 'Enter an email address in the format name@company.com.');
  assert.equal(validateInquiry({ ...good, email: 'a b@c.com' }, ok).errors.email, 'Enter an email address in the format name@company.com.');
});
t('company required', () => {
  assert.equal(validateInquiry({ ...good, company: '  ' }, ok).errors.company, 'Enter your company name.');
});
t('phone optional but validated', () => {
  assert.equal(validateInquiry({ ...good, phone: '+1 (215) 682-2917' }, ok).errors.phone, undefined);
  assert.equal(validateInquiry({ ...good, phone: 'call me' }, ok).errors.phone, 'Use digits, spaces, and + ( ) - only.');
  assert.equal(validateInquiry({ ...good, phone: '12345' }, ok).errors.phone, 'Use digits, spaces, and + ( ) - only.');
});
t('service must be a published option or "other"', () => {
  assert.equal(validateInquiry({ ...good, serviceInterest: 'other' }, ok).errors.service, undefined);
  assert.ok(validateInquiry({ ...good, serviceInterest: 'growth' }, ok).errors.service);
  assert.ok(validateInquiry({ ...good, serviceInterest: '' }, ok).errors.service);
});
t('challenge rules', () => {
  assert.equal(validateInquiry({ ...good, challenge: '' }, ok).errors.challenge, 'Describe the challenge you’d like to discuss.');
  assert.equal(validateInquiry({ ...good, challenge: 'too short' }, ok).errors.challenge, 'Add a little more detail (at least 20 characters).');
  assert.equal(validateInquiry({ ...good, challenge: '1234567890 1234567890 12' }, ok).errors.challenge, 'Add a little more detail (at least 20 characters).');
  assert.equal(validateInquiry({ ...good, challenge: 'abc '.repeat(1001) }, ok).errors.challenge, 'Use 4,000 characters or fewer.');
});
t('contact method', () => {
  assert.equal(validateInquiry({ ...good, preferredContact: '' }, ok).value.preferredContact, null);
  assert.ok(validateInquiry({ ...good, preferredContact: 'fax' }, ok).errors.contactMethod);
});
t('error summary wording', () => {
  assert.equal(errorSummary({ name: 'x' }), 'Please correct 1 field before sending.');
  assert.equal(errorSummary({ name: 'x', email: 'y' }), 'Please correct 2 fields before sending.');
});

console.log('article body');
t('parses headings and paragraphs, round-trips', () => {
  const blocks = parseArticleBody('First line\ncontinues here.\n\n## Heading\n\nSecond para.');
  assert.deepEqual(blocks, [
    { type: 'p', text: 'First line continues here.' },
    { type: 'h', text: 'Heading' },
    { type: 'p', text: 'Second para.' },
  ]);
  assert.deepEqual(parseArticleBody(serializeArticleBody(blocks)), blocks);
});

console.log('content fields');
const slugs = new Set(['strategy', 'operations', 'process']);
t('validates required, lists, services, numbers', () => {
  const challenge = CONTENT_TYPE_MAP.get('challenge')!;
  assert.deepEqual(validateContentFields(challenge, { title: 'T', desc: 'D', service: 'strategy' }, slugs).errors, {});
  assert.ok(validateContentFields(challenge, { title: '', desc: 'D', service: 'nope' }, slugs).errors.service);
  const stage = CONTENT_TYPE_MAP.get('stage')!;
  const r = validateContentFields(stage, { title: 'S', short: 's', points: 'one\n\ntwo' }, slugs);
  assert.deepEqual(r.value.points, ['one', 'two']);
  const matrix = CONTENT_TYPE_MAP.get('matrix-item')!;
  assert.ok(validateContentFields(matrix, { code: 'A', x: 120, y: 50, note: 'n' }, slugs).errors.x);
});

console.log(`\n${passed} checks passed`);
