/**
 * Mirror of backend/src/inquiries/inquiry-validation.ts for instant feedback.
 * The backend remains authoritative; keep the two in sync.
 */

export interface ConsultationForm {
  name: string;
  email: string;
  company: string;
  phone: string;
  service: string;
  challenge: string;
  contact: string;
  website: string; // honeypot
}

export type FormErrors = Partial<Record<keyof ConsultationForm | 'contactMethod', string>>;

export const FIELD_ORDER: (keyof ConsultationForm)[] = ['name', 'email', 'company', 'phone', 'service', 'challenge'];

export function validateConsultation(form: ConsultationForm, serviceValues: string[]): FormErrors {
  const e: FormErrors = {};
  const t = (k: keyof ConsultationForm) => (form[k] || '').trim();

  if (t('name').length < 2) e.name = 'Enter your full name.';
  else if (t('name').length > 120) e.name = 'Use 120 characters or fewer.';

  if (!t('email')) e.email = 'Enter your business email.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t('email')) || t('email').length > 254) e.email = 'Enter an email address in the format name@company.com.';

  if (!t('company')) e.company = 'Enter your company name.';
  else if (t('company').length > 160) e.company = 'Use 160 characters or fewer.';

  if (t('phone') && !/^[+()\d\s.-]{7,40}$/.test(t('phone'))) e.phone = 'Use digits, spaces, and + ( ) - only.';

  if (!form.service || !serviceValues.includes(form.service)) e.service = 'Select a service, or choose “Other / Not sure yet.”';

  const c = t('challenge');
  if (!c) e.challenge = 'Describe the challenge you’d like to discuss.';
  else if (c.length < 20 || !/[a-zA-Z]{3,}/.test(c)) e.challenge = 'Add a little more detail (at least 20 characters).';
  else if (c.length > 4000) e.challenge = 'Use 4,000 characters or fewer.';

  return e;
}

export function errorSummary(count: number) {
  return count === 1 ? 'Please correct 1 field before sending.' : `Please correct ${count} fields before sending.`;
}
