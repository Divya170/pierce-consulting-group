import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ContentBlock } from './content-block.entity';
import { CONTENT_TYPE_MAP, CONTENT_TYPES, ContentTypeDef } from './content.schemas';
import { validateContentFields } from './content.validation';
import { Service } from '../services/service.entity';
import { SettingsService } from '../settings/settings.service';

export interface ContentWriteInput {
  type?: string;
  fields?: Record<string, unknown>;
  published?: boolean;
  isSample?: boolean;
}

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(ContentBlock) private readonly repo: Repository<ContentBlock>,
    @InjectRepository(Service) private readonly services: Repository<Service>,
    private readonly settings: SettingsService,
  ) {}

  types() {
    return CONTENT_TYPES;
  }

  private def(type: string): ContentTypeDef {
    const def = CONTENT_TYPE_MAP.get(type);
    if (!def) throw new BadRequestException(`Unknown content type "${type}".`);
    return def;
  }

  /**
   * Public read: published rows for the requested types, grouped by type.
   * Sample rows are only included when the template-preview setting is on.
   * Service references are resolved to title + links (only for published services).
   */
  async publicBundle(typesParam: string) {
    const types = (typesParam || '').split(',').map((t) => t.trim()).filter((t) => CONTENT_TYPE_MAP.has(t));
    const out: Record<string, unknown[]> = {};
    if (!types.length) return out;

    const [rows, settings, svcRows] = await Promise.all([
      this.repo.find({ where: { type: In(types), published: true }, order: { sortOrder: 'ASC', id: 'ASC' } }),
      this.settings.get(),
      this.services.find({ where: { status: 'published' } }),
    ]);
    const svc = new Map(svcRows.map((s) => [s.slug, s]));

    for (const t of types) out[t] = [];
    for (const row of rows) {
      if (row.isSample && !settings.templatePreview) continue;
      const list = out[row.type];
      const item: Record<string, unknown> = { id: row.id, num: String(list.length + 1).padStart(2, '0'), isSample: row.isSample, ...row.fields };
      const slug = typeof row.fields.service === 'string' ? row.fields.service : '';
      if (slug) {
        const s = svc.get(slug);
        item.serviceTitle = s ? s.title : null;
        item.serviceHref = s ? `/services/${s.slug}` : '/services';
        item.contactHref = s ? `/contact?service=${s.slug}` : '/contact?service=other';
      }
      list.push(item);
    }
    return out;
  }

  async adminList(type: string) {
    this.def(type);
    return this.repo.find({ where: { type }, order: { sortOrder: 'ASC', id: 'ASC' } });
  }

  async counts() {
    const raw = await this.repo
      .createQueryBuilder('c')
      .select('c.type', 'type')
      .addSelect('COUNT(*)', 'total')
      .addSelect('SUM(CASE WHEN c.published = 1 THEN 1 ELSE 0 END)', 'published')
      .groupBy('c.type')
      .getRawMany<{ type: string; total: string; published: string }>();
    return Object.fromEntries(raw.map((r) => [r.type, { total: Number(r.total), published: Number(r.published) }]));
  }

  private async validate(def: ContentTypeDef, fields: Record<string, unknown>) {
    const slugs = new Set((await this.services.find({ select: { slug: true } })).map((s) => s.slug));
    const { value, errors } = validateContentFields(def, fields || {}, slugs);
    if (Object.keys(errors).length) {
      const n = Object.keys(errors).length;
      throw new BadRequestException({ message: n === 1 ? 'Please correct 1 field.' : `Please correct ${n} fields.`, errors });
    }
    return value;
  }

  async create(input: ContentWriteInput) {
    if (!input.type) throw new BadRequestException('Content type is required.');
    const def = this.def(input.type);
    const fields = await this.validate(def, input.fields || {});
    const max = await this.repo
      .createQueryBuilder('c')
      .select('MAX(c.sortOrder)', 'max')
      .where('c.type = :type', { type: def.type })
      .getRawOne<{ max: number | null }>();
    return this.repo.save(
      this.repo.create({
        type: def.type,
        fields,
        published: input.published ?? true,
        isSample: def.sampleable ? !!input.isSample : false,
        sortOrder: (max?.max ?? 0) + 1,
      }),
    );
  }

  async update(id: number, input: ContentWriteInput) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Content item not found.');
    const def = this.def(row.type);
    if (input.fields !== undefined) row.fields = await this.validate(def, { ...row.fields, ...input.fields });
    if (input.published !== undefined) row.published = !!input.published;
    if (input.isSample !== undefined) row.isSample = def.sampleable ? !!input.isSample : false;
    return this.repo.save(row);
  }

  async remove(id: number) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Content item not found.');
    await this.repo.remove(row);
    return { ok: true };
  }

  async reorder(type: string, ids: number[]) {
    this.def(type);
    const rows = await this.repo.find({ where: { type, id: In(ids) } });
    if (rows.length !== ids.length) throw new BadRequestException('Reorder list does not match items of this type.');
    await Promise.all(ids.map((id, i) => this.repo.update({ id }, { sortOrder: i + 1 })));
    return this.adminList(type);
  }

  /** Used by the seeder. */
  async seedType(type: string, items: Record<string, unknown>[], opts: { isSample?: boolean } = {}) {
    if ((await this.repo.count({ where: { type } })) > 0) return 0;
    await this.repo.save(
      items.map((fields, i) => this.repo.create({ type, fields, sortOrder: i + 1, published: true, isSample: !!opts.isSample })),
    );
    return items.length;
  }
}
