import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './service.entity';
import { CreateServiceDto, UpdateServiceDto } from './service.dto';
import { slugify } from '../common/utils';

export const OTHER_SERVICE = { value: 'other', label: 'Other / Not sure yet' };

@Injectable()
export class ServicesService {
  constructor(@InjectRepository(Service) private readonly repo: Repository<Service>) {}

  private ordered() {
    return { order: { sortOrder: 'ASC' as const, id: 'ASC' as const } };
  }

  /** Published services with their display number ("01", "02"…) in public order. */
  async listPublished() {
    const rows = await this.repo.find({ where: { status: 'published' }, ...this.ordered() });
    return rows.map((s, i) => this.toPublic(s, i));
  }

  async getPublished(slug: string) {
    const rows = await this.listPublished();
    const found = rows.find((s) => s.slug === slug);
    if (!found) throw new NotFoundException('Service not found.');
    return found;
  }

  listAll() {
    return this.repo.find(this.ordered());
  }

  /** Options for the consultation form: published services + "Other / Not sure yet". */
  async options() {
    const rows = await this.listPublished();
    return [...rows.map((s) => ({ value: s.slug, label: s.title })), OTHER_SERVICE];
  }

  /** Title for a slug (any status), used to snapshot enquiries. */
  async titleFor(slug: string): Promise<string> {
    if (slug === OTHER_SERVICE.value) return OTHER_SERVICE.label;
    const s = await this.repo.findOne({ where: { slug } });
    return s ? s.title : slug;
  }

  async isValidOption(slug: string): Promise<boolean> {
    if (slug === OTHER_SERVICE.value) return true;
    return (await this.repo.count({ where: { slug, status: 'published' } })) > 0;
  }

  async create(dto: CreateServiceDto) {
    const slug = dto.slug || slugify(dto.title);
    if (!slug) throw new BadRequestException({ message: 'Enter a valid slug.', errors: { slug: 'Enter a valid slug.' } });
    if (slug === OTHER_SERVICE.value) {
      throw new BadRequestException({ message: '"other" is reserved.', errors: { slug: '"other" is reserved for “Other / Not sure yet”.' } });
    }
    if (await this.repo.findOne({ where: { slug } })) {
      throw new ConflictException({ message: 'A service with this slug already exists.', errors: { slug: 'This slug is already in use.' } });
    }
    const max = await this.repo.createQueryBuilder('s').select('MAX(s.sortOrder)', 'max').getRawOne<{ max: number | null }>();
    const entity = this.repo.create({
      slug,
      title: dto.title.trim(),
      kicker: (dto.kicker || '').trim().toUpperCase(),
      summary: (dto.summary || '').trim(),
      purpose: (dto.purpose || '').trim(),
      body: (dto.body || '').trim(),
      focusAreas: this.cleanList(dto.focusAreas),
      visual: dto.visual || 'none',
      ctaLabel: (dto.ctaLabel || `Discuss ${dto.title.trim()}`).trim(),
      status: dto.status || 'draft',
      sortOrder: dto.sortOrder ?? (max?.max ?? 0) + 1,
    });
    return this.repo.save(entity);
  }

  async update(id: number, dto: UpdateServiceDto) {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Service not found.');
    if (dto.title !== undefined) s.title = dto.title.trim();
    if (dto.kicker !== undefined) s.kicker = dto.kicker.trim().toUpperCase();
    if (dto.summary !== undefined) s.summary = dto.summary.trim();
    if (dto.purpose !== undefined) s.purpose = dto.purpose.trim();
    if (dto.body !== undefined) s.body = dto.body.trim();
    if (dto.focusAreas !== undefined) s.focusAreas = this.cleanList(dto.focusAreas);
    if (dto.visual !== undefined) s.visual = dto.visual;
    if (dto.ctaLabel !== undefined) s.ctaLabel = dto.ctaLabel.trim();
    if (dto.status !== undefined) s.status = dto.status;
    if (dto.sortOrder !== undefined) s.sortOrder = dto.sortOrder;
    if (s.status === 'published' && (!s.purpose || !s.body)) {
      throw new BadRequestException({
        message: 'Add a purpose and description before publishing.',
        errors: { ...(s.purpose ? {} : { purpose: 'Required to publish.' }), ...(s.body ? {} : { body: 'Required to publish.' }) },
      });
    }
    return this.repo.save(s);
  }

  async remove(id: number) {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Service not found.');
    await this.repo.remove(s);
    return { ok: true };
  }

  async reorder(ids: number[]) {
    await Promise.all(ids.map((id, i) => this.repo.update({ id }, { sortOrder: i + 1 })));
    return this.listAll();
  }

  private cleanList(list?: string[]) {
    return (list || []).map((x) => x.trim()).filter(Boolean);
  }

  private toPublic(s: Service, index: number) {
    return {
      id: s.id,
      slug: s.slug,
      num: String(index + 1).padStart(2, '0'),
      title: s.title,
      kicker: s.kicker,
      summary: s.summary,
      purpose: s.purpose,
      body: s.body,
      focusAreas: s.focusAreas,
      visual: s.visual,
      ctaLabel: s.ctaLabel || `Discuss ${s.title}`,
    };
  }
}
