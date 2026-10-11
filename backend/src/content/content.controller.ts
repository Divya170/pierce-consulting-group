import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ArrayNotEmpty, IsArray, IsBoolean, IsInt, IsObject, IsOptional, IsString } from 'class-validator';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

class CreateContentDto {
  @IsString() type: string;
  @IsObject() fields: Record<string, unknown>;
  @IsOptional() @IsBoolean() published?: boolean;
  @IsOptional() @IsBoolean() isSample?: boolean;
}

class UpdateContentDto {
  @IsOptional() @IsObject() fields?: Record<string, unknown>;
  @IsOptional() @IsBoolean() published?: boolean;
  @IsOptional() @IsBoolean() isSample?: boolean;
}

class ReorderContentDto {
  @IsString() type: string;
  @IsArray() @ArrayNotEmpty() @IsInt({ each: true }) ids: number[];
}

@Controller('content')
export class ContentController {
  constructor(private readonly content: ContentService) {}

  /** GET /api/content?types=faq,stage → { faq: [...], stage: [...] } */
  @Get()
  bundle(@Query('types') types: string) {
    return this.content.publicBundle(types);
  }

  @Get('types')
  @UseGuards(JwtAuthGuard)
  types() {
    return this.content.types();
  }

  @Get('admin/counts')
  @UseGuards(JwtAuthGuard)
  counts() {
    return this.content.counts();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  adminList(@Query('type') type: string) {
    return this.content.adminList(type);
  }

  @Post('admin/reorder')
  @UseGuards(JwtAuthGuard)
  reorder(@Body() dto: ReorderContentDto) {
    return this.content.reorder(dto.type, dto.ids);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateContentDto) {
    return this.content.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateContentDto) {
    return this.content.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.content.remove(id);
  }
}
