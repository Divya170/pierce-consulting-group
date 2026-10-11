import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { Insight } from './insight.entity';
import { CreateInsightDto, UpdateInsightDto } from './insight.dto';
import { parseArticleBody, serializeArticleBody } from './article-body';
import { Service } from '../services/service.entity';
import { SettingsService } from '../settings/settings.service';
import { clampInt, slugify } from '../common/utils';

export interface InsightQuery {
  category?: string;
  q?: string;
  offset?: string | number;
  limit?: string | number;
}

@Injectable()
export class InsightsService {
  constructor(
    @InjectRepository(Insight) private readonly repo: Repository<Insight>,
    @InjectRepository(Service) private readonly services: Repository<Service>,
    private readonly settings: SettingsService,
  ) {}

  /** Published rows the public may see (samples only in template-preview mode). */
  private async visibleQuery(): Promise<SelectQueryBuilder<Insight>> {
    const s = await this.settings.get();
    const qb = this.repo.createQueryBuilder('i').where('i.status = :status', { status: 'published' });
    if (!s.templatePreview) qb.andWhere('i.isSample = 0');
    return qb;
  }

  private applyOrder(qb: SelectQueryBuilder<Insight>) {
    return qb.orderBy('i.featured', 'DESC').addOrderBy('i.publishedAt', 'DESC').addOrderBy('i.id', 'DESC');
  }

  async listPublic(query: InsightQuery) {
    const offset = clampInt(query.offset, 0, 10_000, 0);
    const limit = clampInt(query.limit, 1, 50, 7);
    const category = (query.category || '').trim();
    const q = (query.q || '').trim().toLowerCase().slice(0, 100);

    // Categories come from every visible article, independent of the active filter
    const catRows = await this.applyOrder(await this.visibleQuery()).select(['i.id', 'i.category', 'i.isSample']).getMany();
    const categories = Array.from(new Set(catRows.map((r) => r.category)));
    const totalVisible = catRows.length;
    const hasSamples = catRows.some((r) => r.isSample);

    const qb = await this.visibleQuery();
    if (category && category !== 'All') qb.andWhere('i.category = :category', { category });
    if (q) {
      qb.andWhere(
        new Brackets((w) => {
          w.where('LOWER(i.title) LIKE :q', { q: `%${q}%` }).orWhere('LOWER(i.excerpt) LIKE :q', { q: `%${q}%` });
        }),
      );
    }
    const [rows, total] = await this.applyOrder(qb).skip(offset).take(limit).getManyAndCount();
    const titles = await this.serviceTitles();
    return {
      items: rows.map((r) => this.toCard(r, titles)),
      total,
      totalVisible,
      offset,
      limit,
      categories,
      hasSamples,
    };
  }

  async getPublic(slug: string) {
    const qb = await this.visibleQuery();
    const row = await qb.andWhere('i.slug = :slug', { slug }).getOne();
    if (!row) throw new NotFoundException("This article isn't available.");
    const titles = await this.serviceTitles();
    return { ...this.toCard(row, titles), author: row.author, body: row.body };
  }

  // ---------- admin ----------

  async adminList(status?: string, q?: string) {
    const qb = this.repo.createQueryBuilder('i');
    if (status === 'draft' || status === 'published') qb.where('i.status = :status', { status });
    if (q && q.trim()) {
      const like = `%${q.trim().toLowerCase()}%`;
      qb.andWhere(new Brackets((w) => w.where('LOWER(i.title) LIKE :like', { like }).orWhere('LOWER(i.category) LIKE :like', { like })));
    }
    const rows = await qb.orderBy('i.updatedAt', 'DESC').getMany();
    return rows.map((r) => ({ ...r, bodyText: serializeArticleBody(r.body) }));
  }

  async adminGet(id: number) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Article not found.');
    return { ...r, bodyText: serializeArticleBody(r.body) };
  }

  async create(dto: CreateInsightDto) {
    const slug = dto.slug || slugify(dto.title);
    await this.assertSlugFree(slug);
    await this.assertService(dto.serviceSlug);
    const status = dto.status || 'draft';
    const entity = this.repo.create({
      slug,
      title: dto.title.trim(),
      category: dto.category.trim(),
      serviceSlug: dto.serviceSlug || null,
      image: dto.image || null,
      excerpt: dto.excerpt.trim(),
      body: parseArticleBody(dto.body),
      author: dto.author?.trim() || null,
      status,
      featured: !!dto.featured,
      isSample: !!dto.isSample,
      publishedAt: status === 'published' ? new Date() : null,
    });
    const saved = await this.repo.save(entity);
    if (saved.featured) await this.clearOtherFeatured(saved.id);
    return this.adminGet(saved.id);
  }

  async update(id: number, dto: UpdateInsightDto) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Article not found.');
    if (dto.slug !== undefined && dto.slug !== r.slug) {
      await this.assertSlugFree(dto.slug);
      r.slug = dto.slug;
    }
    if (dto.serviceSlug !== undefined) {
      await this.assertService(dto.serviceSlug);
      r.serviceSlug = dto.serviceSlug || null;
    }
    if (dto.title !== undefined) r.title = dto.title.trim();
    if (dto.category !== undefined) r.category = dto.category.trim();
    if (dto.image !== undefined) r.image = dto.image || null;
    if (dto.excerpt !== undefined) r.excerpt = dto.excerpt.trim();
    if (dto.body !== undefined) r.body = parseArticleBody(dto.body);
    if (dto.author !== undefined) r.author = dto.author?.trim() || null;
    if (dto.featured !== undefined) r.featured = dto.featured;
    if (dto.isSample !== undefined) r.isSample = dto.isSample;
    if (dto.status !== undefined) {
      if (dto.status === 'published' && !r.publishedAt) r.publishedAt = new Date();
      r.status = dto.status;
    }
    if (r.body.length === 0) throw new BadRequestException({ message: 'Article body is empty.', errors: { body: 'Write the article body.' } });
    await this.repo.save(r);
    if (r.featured) await this.clearOtherFeatured(r.id);
    return this.adminGet(r.id);
  }

  async remove(id: number) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Article not found.');
    await this.repo.remove(r);
    return { ok: true };
  }

  async seed(items: Partial<Insight>[]) {
    if ((await this.repo.count()) > 0) return 0;
    await this.repo.save(items.map((i) => this.repo.create(i)));
    return items.length;
  }

  // ---------- helpers ----------

  /** Only one featured article at a time. */
  private async clearOtherFeatured(keepId: number) {
    await this.repo.createQueryBuilder().update(Insight).set({ featured: false }).where('id != :id', { id: keepId }).execute();
  }

  private async assertSlugFree(slug: string) {
    if (!slug) throw new BadRequestException({ message: 'Enter a valid slug.', errors: { slug: 'Enter a valid slug.' } });
    if (await this.repo.findOne({ where: { slug } })) {
      throw new ConflictException({ message: 'Slug already in use.', errors: { slug: 'Another article already uses this slug.' } });
    }
  }

  private async assertService(slug?: string | null) {
    if (!slug) return;
    if (!(await this.services.findOne({ where: { slug } }))) {
      throw new BadRequestException({ message: 'Unknown service.', errors: { serviceSlug: 'Select an existing service.' } });
    }
  }

  private async serviceTitles() {
    const rows = await this.services.find({ where: { status: 'published' } });
    return new Map(rows.map((s) => [s.slug, s.title]));
  }

  private toCard(r: Insight, titles: Map<string, string>) {
    const svcTitle = r.serviceSlug ? titles.get(r.serviceSlug) : undefined;
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      category: r.category,
      excerpt: r.excerpt,
      image: r.image,
      featured: r.featured,
      isSample: r.isSample,
      publishedAt: r.publishedAt,
      serviceSlug: svcTitle ? r.serviceSlug : null,
      serviceTitle: svcTitle || null,
      serviceHref: svcTitle ? `/services/${r.serviceSlug}` : '/services',
      contactHref: svcTitle ? `/contact?service=${r.serviceSlug}` : '/contact',
    };
  }
}
