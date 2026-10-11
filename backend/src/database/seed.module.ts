import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { SettingsModule } from '../settings/settings.module';
import { ContentModule } from '../content/content.module';
import { InsightsModule } from '../insights/insights.module';
import { Service } from '../services/service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Service]), AdminAuthModule, SettingsModule, ContentModule, InsightsModule],
  providers: [SeedService],
})
export class SeedModule {}
