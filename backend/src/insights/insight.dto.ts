import { IsBoolean, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { INSIGHT_STATUSES } from './insight.entity';
import type { InsightStatus } from './insight.entity';

export class CreateInsightDto {
  @IsString() @MinLength(4, { message: 'Enter a title of at least 4 characters.' }) @MaxLength(160) title: string;

  @IsOptional()
  @ValidateIf((o) => o.slug !== '')
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Use lowercase letters, numbers and hyphens only.' })
  @MaxLength(80)
  slug?: string;

  @IsString() @MinLength(2, { message: 'Enter a category.' }) @MaxLength(40) category: string;
  @IsOptional() @ValidateIf((o) => o.serviceSlug !== null && o.serviceSlug !== '') @IsString() serviceSlug?: string | null;
  @IsOptional() @ValidateIf((o) => o.image !== null && o.image !== '') @Matches(/^(\/uploads\/|\/assets\/|https?:\/\/)/, { message: 'Upload an image or use an https:// URL.' }) image?: string | null;
  @IsString() @MinLength(10, { message: 'Write a short excerpt (at least 10 characters).' }) @MaxLength(400) excerpt: string;
  /** Plain text: "## " lines are headings, blank lines separate paragraphs */
  @IsString() @MinLength(20, { message: 'Write the article body (at least 20 characters).' }) @MaxLength(60000) body: string;
  @IsOptional() @ValidateIf((o) => o.author !== null) @IsString() @MaxLength(120) author?: string | null;
  @IsOptional() @IsIn(INSIGHT_STATUSES as unknown as string[]) status?: InsightStatus;
  @IsOptional() @IsBoolean() featured?: boolean;
  @IsOptional() @IsBoolean() isSample?: boolean;
}

export class UpdateInsightDto {
  @IsOptional() @IsString() @MinLength(4, { message: 'Enter a title of at least 4 characters.' }) @MaxLength(160) title?: string;
  @IsOptional() @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Use lowercase letters, numbers and hyphens only.' }) @MaxLength(80) slug?: string;
  @IsOptional() @IsString() @MinLength(2, { message: 'Enter a category.' }) @MaxLength(40) category?: string;
  @IsOptional() @ValidateIf((o) => o.serviceSlug !== null && o.serviceSlug !== '') @IsString() serviceSlug?: string | null;
  @IsOptional() @ValidateIf((o) => o.image !== null && o.image !== '') @Matches(/^(\/uploads\/|\/assets\/|https?:\/\/)/, { message: 'Upload an image or use an https:// URL.' }) image?: string | null;
  @IsOptional() @IsString() @MinLength(10, { message: 'Write a short excerpt (at least 10 characters).' }) @MaxLength(400) excerpt?: string;
  @IsOptional() @IsString() @MinLength(20, { message: 'Write the article body (at least 20 characters).' }) @MaxLength(60000) body?: string;
  @IsOptional() @ValidateIf((o) => o.author !== null) @IsString() @MaxLength(120) author?: string | null;
  @IsOptional() @IsIn(INSIGHT_STATUSES as unknown as string[]) status?: InsightStatus;
  @IsOptional() @IsBoolean() featured?: boolean;
  @IsOptional() @IsBoolean() isSample?: boolean;
}
