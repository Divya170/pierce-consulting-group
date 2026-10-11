import { ArrayMaxSize, IsArray, IsIn, IsInt, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { SERVICE_STATUSES, SERVICE_VISUALS } from './service.entity';
import type { ServiceStatus, ServiceVisual } from './service.entity';

export class CreateServiceDto {
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Use lowercase letters, numbers and hyphens only.' })
  @MaxLength(60)
  slug?: string;

  @IsString()
  @MinLength(2, { message: 'Enter a service title.' })
  @MaxLength(120)
  title: string;

  @IsOptional() @IsString() @MaxLength(40) kicker?: string;
  @IsOptional() @IsString() @MaxLength(400) summary?: string;
  @IsOptional() @IsString() @MaxLength(400) purpose?: string;
  @IsOptional() @IsString() @MaxLength(4000) body?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  focusAreas?: string[];

  @IsOptional() @IsIn(SERVICE_VISUALS as unknown as string[]) visual?: ServiceVisual;
  @IsOptional() @IsString() @MaxLength(80) ctaLabel?: string;
  @IsOptional() @IsIn(SERVICE_STATUSES as unknown as string[]) status?: ServiceStatus;
  @IsOptional() @IsInt() sortOrder?: number;
}

/** Slug is immutable once created (it is referenced by URLs, content and enquiries). */
export class UpdateServiceDto {
  @IsOptional() @IsString() @MinLength(2, { message: 'Enter a service title.' }) @MaxLength(120) title?: string;
  @IsOptional() @IsString() @MaxLength(40) kicker?: string;
  @IsOptional() @IsString() @MaxLength(400) summary?: string;
  @IsOptional() @IsString() @MaxLength(400) purpose?: string;
  @IsOptional() @IsString() @MaxLength(4000) body?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(12) @IsString({ each: true }) @MaxLength(80, { each: true }) focusAreas?: string[];
  @IsOptional() @IsIn(SERVICE_VISUALS as unknown as string[]) visual?: ServiceVisual;
  @IsOptional() @IsString() @MaxLength(80) ctaLabel?: string;
  @IsOptional() @IsIn(SERVICE_STATUSES as unknown as string[]) status?: ServiceStatus;
  @IsOptional() @IsInt() sortOrder?: number;
}
