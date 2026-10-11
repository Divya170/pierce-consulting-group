import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto } from './service.dto';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

class ReorderDto {
  @IsArray() @ArrayNotEmpty() @IsInt({ each: true }) ids: number[];
}

@Controller('services')
export class ServicesController {
  constructor(private readonly services: ServicesService) {}

  @Get()
  listPublished() {
    return this.services.listPublished();
  }

  @Get('options')
  options() {
    return this.services.options();
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  listAll() {
    return this.services.listAll();
  }

  @Post('admin/reorder')
  @UseGuards(JwtAuthGuard)
  reorder(@Body() dto: ReorderDto) {
    return this.services.reorder(dto.ids);
  }

  @Get(':slug')
  get(@Param('slug') slug: string) {
    return this.services.getPublished(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateServiceDto) {
    return this.services.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateServiceDto) {
    return this.services.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.services.remove(id);
  }
}
