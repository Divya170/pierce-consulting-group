import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { resolve } from 'path';
import { CommonModule } from './common/common.module';
import { AdminAuthModule } from './admin-auth/admin-auth.module';
import { SettingsModule } from './settings/settings.module';
import { ServicesModule } from './services/services.module';
import { ContentModule } from './content/content.module';
import { InsightsModule } from './insights/insights.module';
import { InquiriesModule } from './inquiries/inquiries.module';
import { UploadsModule } from './uploads/uploads.module';
import { SeedModule } from './database/seed.module';
import { AdminUser } from './admin-auth/admin-user.entity';
import { Settings } from './settings/settings.entity';
import { Service } from './services/service.entity';
import { ContentBlock } from './content/content-block.entity';
import { Insight } from './insights/insight.entity';
import { Inquiry } from './inquiries/inquiry.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'sqlite' as const,
        // backend/ is the working directory when started via npm scripts
        database: resolve(process.cwd(), process.env.DATABASE_PATH || '../database/app.sqlite'),
        entities: [AdminUser, Settings, Service, ContentBlock, Insight, Inquiry],
        synchronize: true,
      }),
    }),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 120 }]),
    CommonModule,
    AdminAuthModule,
    SettingsModule,
    ServicesModule,
    ContentModule,
    InsightsModule,
    InquiriesModule,
    UploadsModule,
    SeedModule,
  ],
})
export class AppModule {}
