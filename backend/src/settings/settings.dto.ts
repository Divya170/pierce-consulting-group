import { IsBoolean, IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Enter the contact name.' })
  @MaxLength(120)
  contactName?: string;

  @IsOptional()
  @ValidateIf((o) => o.email !== null && o.email !== '')
  @IsEmail({}, { message: 'Enter an email address in the format name@company.com.' })
  @MaxLength(254)
  email?: string | null;

  @IsOptional()
  @ValidateIf((o) => o.phone !== null && o.phone !== '')
  @Matches(/^[+()\d\s.-]{7,40}$/, { message: 'Use digits, spaces, and + ( ) - only.' })
  phone?: string | null;

  @IsOptional()
  @ValidateIf((o) => o.address !== null)
  @IsString()
  @MaxLength(240)
  address?: string | null;

  @IsOptional()
  @IsBoolean()
  showAddress?: boolean;

  @IsOptional()
  @IsBoolean()
  heroRotate?: boolean;

  @IsOptional()
  @IsBoolean()
  templatePreview?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(20000)
  privacyPolicy?: string;
}
