import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { Inquiry, INQUIRY_STATUSES, InquiryStatus } from './inquiry.entity';
import { errorSummary, InquiryInput, validateInquiry } from './inquiry-validation';
import { ServicesService } from '../services/services.service';
import { clampInt, csvCell } from '../common/utils';

export const STATUS_LABELS: Record<InquiryStatus, string> = {
  new: 'New',
  review: 'In Review',
  contacted: 'Contacted',
  closed: 'Closed',
};

@Injectable()
export class InquiriesService {
  private readonly logger = new Logger('Inquiries');

  constructor(
    @InjectRepository(Inquiry) private readonly repo: Repository<Inquiry>,
    private readonly services: ServicesService,
  ) {}

  async submit(input: InquiryInput, idempotencyKey?: string) {
    // Honeypot: bots fill the hidden "website" field. Pretend success, store nothing.
    if (typeof input.website === 'string' && input.website.trim() !== '') {
      this.logger.warn('Honeypot triggered — submission discarded');
      return { id: null, reference: 'PCG-RECEIVED', createdAt: new Date().toISOString(), duplicate: false };
    }

    const key = String(idempotencyKey || input.clientRequestId || '').trim().slice(0, 100) || null;
    if (key) {
      const existing = await this.repo.findOne({ where: { clientRequestId: key } });
      if (existing) return { id: existing.id, reference: existing.reference, createdAt: existing.createdAt, duplicate: true };
    }

    const options = new Set((await this.services.options()).map((o) => o.value));
    const { value, errors } = validateInquiry(input, (slug) => options.has(slug));
    if (Object.keys(errors).length) {
      throw new BadRequestException({ statusCode: 400, message: errorSummary(errors), errors });
    }

    const entity = this.repo.create({
      ...value,
      serviceTitle: await this.services.titleFor(value.serviceInterest),
      clientRequestId: key,
      reference: await this.newReference(),
      status: 'new',
      notes: '',
    });
    const saved = await this.repo.save(entity);
    this.logger.log(`New consultation request ${saved.reference} from ${saved.company}`);
    return { id: saved.id, reference: saved.reference, createdAt: saved.createdAt, duplicate: false };
  }

  async list(params: { status?: string; q?: string; service?: string; page?: string; limit?: string; sort?: string }) {
    const page = clampInt(params.page, 1, 10_000, 1);
    const limit = clampInt(params.limit, 1, 100, 25);
    const qb = this.repo.createQueryBuilder('x');
    if (params.status && (INQUIRY_STATUSES as readonly string[]).includes(params.status)) {
      qb.andWhere('x.status = :status', { status: params.status });
    }
    if (params.service) qb.andWhere('x.serviceInterest = :service', { service: params.service });
    const q = (params.q || '').trim().toLowerCase();
    if (q) {
      const like = `%${q}%`;
      qb.andWhere(
        new Brackets((w) =>
          w
            .where('LOWER(x.fullName) LIKE :like', { like })
            .orWhere('LOWER(x.company) LIKE :like', { like })
            .orWhere('LOWER(x.email) LIKE :like', { like })
            .orWhere('LOWER(x.reference) LIKE :like', { like }),
        ),
      );
    }
    qb.orderBy('x.createdAt', params.sort === 'oldest' ? 'ASC' : 'DESC');
    const [items, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { items, total, page, limit, pages: Math.max(1, Math.ceil(total / limit)), counts: await this.counts() };
  }

  async counts() {
    const raw = await this.repo.createQueryBuilder('x').select('x.status', 'status').addSelect('COUNT(*)', 'n').groupBy('x.status').getRawMany<{ status: string; n: string }>();
    const counts: Record<string, number> = { all: 0, new: 0, review: 0, contacted: 0, closed: 0 };
    for (const r of raw) {
      counts[r.status] = Number(r.n);
      counts.all += Number(r.n);
    }
    return counts;
  }

  async stats() {
    const counts = await this.counts();
    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const last30 = await this.repo.createQueryBuilder('x').where('x.createdAt >= :since', { since: since.toISOString().replace('T', ' ').slice(0, 19) }).getCount();
    const byService = await this.repo
      .createQueryBuilder('x')
      .select('x.serviceTitle', 'service')
      .addSelect('COUNT(*)', 'n')
      .groupBy('x.serviceTitle')
      .orderBy('n', 'DESC')
      .getRawMany<{ service: string; n: string }>();
    const recent = await this.repo.find({ order: { createdAt: 'DESC' }, take: 5 });
    return { counts, last30, byService: byService.map((r) => ({ service: r.service, count: Number(r.n) })), recent };
  }

  async get(id: string) {
    const x = await this.repo.findOne({ where: { id } });
    if (!x) throw new NotFoundException('Enquiry not found.');
    return x;
  }

  async update(id: string, patch: { status?: InquiryStatus; notes?: string }) {
    const x = await this.get(id);
    if (patch.status !== undefined) x.status = patch.status;
    if (patch.notes !== undefined) x.notes = patch.notes;
    return this.repo.save(x);
  }

  async remove(id: string) {
    const x = await this.get(id);
    await this.repo.remove(x);
    return { ok: true };
  }

  async exportCsv(status?: string) {
    const qb = this.repo.createQueryBuilder('x').orderBy('x.createdAt', 'DESC');
    if (status && (INQUIRY_STATUSES as readonly string[]).includes(status)) qb.where('x.status = :status', { status });
    const rows = await qb.getMany();
    const header = ['Reference', 'Submitted', 'Status', 'Full name', 'Email', 'Company', 'Phone', 'Service', 'Preferred contact', 'Challenge', 'Notes'];
    const lines = rows.map((r) =>
      [r.reference, new Date(r.createdAt).toISOString(), STATUS_LABELS[r.status], r.fullName, r.email, r.company, r.phone, r.serviceTitle, r.preferredContact || 'No preference', r.challenge, r.notes]
        .map(csvCell)
        .join(','),
    );
    return [header.join(','), ...lines].join('\r\n');
  }

  private async newReference(): Promise<string> {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    for (let attempt = 0; attempt < 5; attempt++) {
      const bytes = randomBytes(6);
      const ref = 'PCG-' + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
      if (!(await this.repo.findOne({ where: { reference: ref } }))) return ref;
    }
    return 'PCG-' + Date.now().toString(36).toUpperCase();
  }
}
