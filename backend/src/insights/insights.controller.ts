import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { CreateInsightDto, UpdateInsightDto } from './insight.dto';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@Controller('insights')
export class InsightsController {
  constructor(private readonly insights: InsightsService) {}

  /** GET /api/insights?category=Strategy&q=handoff&offset=0&limit=7 */
  @Get()
  list(@Query('category') category?: string, @Query('q') q?: string, @Query('offset') offset?: string, @Query('limit') limit?: string) {
    return this.insights.listPublic({ category, q, offset, limit });
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  adminList(@Query('status') status?: string, @Query('q') q?: string) {
    return this.insights.adminList(status, q);
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard)
  adminGet(@Param('id', ParseIntPipe) id: number) {
    return this.insights.adminGet(id);
  }

  @Get(':slug')
  get(@Param('slug') slug: string) {
    return this.insights.getPublic(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateInsightDto) {
    return this.insights.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInsightDto) {
    return this.insights.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.insights.remove(id);
  }
}
