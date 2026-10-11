/**
 * Consultation-form validation — mirrors the rules and messages of the design
 * comp exactly (see DATA-MODEL.md). The frontend mirrors the same function for
 * instant feedback; this one is authoritative.
 */

export interface InquiryInput {
  fullName?: unknown;
  email?: unknown;
  company?: unknown;
  phone?: unknown;
  serviceInterest?: unknown;
  challenge?: unknown;
  preferredContact?: unknown;
  website?: unknown; // honeypot
  clientRequestId?: unknown;
}

export interface CleanInquiry {
  fullName: string;
  email: string;
  company: string;
  phone: string | null;
  serviceInterest: string;
  challenge: string;
  preferredContact: 'email' | 'phone' | null;
}

/** Field keys use the public form names so the frontend can map errors 1:1. */
export type InquiryErrors = Partial<Record<'name' | 'email' | 'company' | 'phone' | 'service' | 'challenge' | 'contactMethod', string>>;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_RE = /^[+()\d\s.-]{7,40}$/;

const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));

export function validateInquiry(
  input: InquiryInput,
  isValidService: (slug: string) => boolean,
): { value: CleanInquiry; errors: InquiryErrors } {
  const e: InquiryErrors = {};
  const name = str(input.fullName).trim();
  const email = str(input.email).trim();
  const company = str(input.company).trim();
  const phone = str(input.phone).trim();
  const service = str(input.serviceInterest).trim();
  const challenge = str(input.challenge).trim();
  const contact = str(input.preferredContact).trim();

  if (name.length < 2) e.name = 'Enter your full name.';
  else if (name.length > 120) e.name = 'Use 120 characters or fewer.';

  if (!email) e.email = 'Enter your business email.';
  else if (!EMAIL_RE.test(email) || email.length > 254) e.email = 'Enter an email address in the format name@company.com.';

  if (!company) e.company = 'Enter your company name.';
  else if (company.length > 160) e.company = 'Use 160 characters or fewer.';

  if (phone && !PHONE_RE.test(phone)) e.phone = 'Use digits, spaces, and + ( ) - only.';

  if (!service || !isValidService(service)) e.service = 'Select a service, or choose “Other / Not sure yet.”';

  if (!challenge) e.challenge = 'Describe the challenge you’d like to discuss.';
  else if (challenge.length < 20 || !/[a-zA-Z]{3,}/.test(challenge)) e.challenge = 'Add a little more detail (at least 20 characters).';
  else if (challenge.length > 4000) e.challenge = 'Use 4,000 characters or fewer.';

  if (contact && contact !== 'email' && contact !== 'phone') e.contactMethod = 'Choose email or phone.';

  return {
    value: {
      fullName: name,
      email: email.toLowerCase(),
      company,
      phone: phone || null,
      serviceInterest: service,
      challenge,
      preferredContact: contact === 'email' || contact === 'phone' ? contact : null,
    },
    errors: e,
  };
}

export function errorSummary(errors: InquiryErrors): string {
  const n = Object.keys(errors).length;
  return n === 1 ? 'Please correct 1 field before sending.' : `Please correct ${n} fields before sending.`;
}
