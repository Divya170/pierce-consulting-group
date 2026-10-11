import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminAuthService } from '../admin-auth/admin-auth.service';
import { SettingsService } from '../settings/settings.service';
import { ContentService } from '../content/content.service';
import { InsightsService } from '../insights/insights.service';
import { Service } from '../services/service.entity';
import { CONTENT_SEED, SAMPLE_CONTENT_SEED, SAMPLE_INSIGHTS_SEED, SERVICES_SEED } from './seed-data';

/** Idempotent first-boot seed: every step checks before inserting. */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger('Seed');

  constructor(
    private readonly auth: AdminAuthService,
    private readonly settings: SettingsService,
    private readonly content: ContentService,
    private readonly insights: InsightsService,
    @InjectRepository(Service) private readonly services: Repository<Service>,
  ) {}

  async onApplicationBootstrap() {
    await this.settings.ensure();
    await this.auth.ensureDefaultAdmin();

    let created = 0;
    for (const s of SERVICES_SEED) {
      if (!(await this.services.findOne({ where: { slug: s.slug } }))) {
        await this.services.save(this.services.create(s));
        created++;
      }
    }

    for (const [type, items] of Object.entries(CONTENT_SEED)) created += await this.content.seedType(type, items);
    for (const [type, items] of Object.entries(SAMPLE_CONTENT_SEED)) created += await this.content.seedType(type, items, { isSample: true });
    created += await this.insights.seed(SAMPLE_INSIGHTS_SEED);

    if (created) this.logger.log(`Seeded ${created} records from the design comp.`);
  }
}
