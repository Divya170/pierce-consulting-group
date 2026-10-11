import { Body, Controller, Delete, Get, Headers, Param, ParseUUIDPipe, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import type { Response } from 'express';
import { InquiriesService } from './inquiries.service';
import { INQUIRY_STATUSES } from './inquiry.entity';
import type { InquiryStatus } from './inquiry.entity';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

/**
 * Public body is accepted loosely here and validated by validateInquiry(),
 * which returns the exact per-field messages from the design comp.
 */
class SubmitInquiryDto {
  @IsOptional() fullName?: unknown;
  @IsOptional() email?: unknown;
  @IsOptional() company?: unknown;
  @IsOptional() phone?: unknown;
  @IsOptional() serviceInterest?: unknown;
  @IsOptional() challenge?: unknown;
  @IsOptional() preferredContact?: unknown;
  @IsOptional() website?: unknown;
  @IsOptional() clientRequestId?: unknown;
}

class UpdateInquiryDto {
  @IsOptional() @IsIn(INQUIRY_STATUSES as unknown as string[], { message: 'Choose a valid status.' }) status?: InquiryStatus;
  @IsOptional() @IsString() @MaxLength(5000, { message: 'Keep notes under 5,000 characters.' }) notes?: string;
}

// Exposed on both paths: /api/inquiries and /api/consultations (the endpoint named in the design comp)
@Controller(['inquiries', 'consultations'])
export class InquiriesController {
  constructor(private readonly inquiries: InquiriesService) {}

  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  submit(@Body() body: SubmitInquiryDto, @Headers('idempotency-key') key?: string) {
    return this.inquiries.submit(body, key);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  list(
    @Query('status') status?: string,
    @Query('q') q?: string,
    @Query('service') service?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
  ) {
    return this.inquiries.list({ status, q, service, page, limit, sort });
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  stats() {
    return this.inquiries.stats();
  }

  @Get('export.csv')
  @UseGuards(JwtAuthGuard)
  async export(@Res() res: Response, @Query('status') status?: string) {
    const csv = await this.inquiries.exportCsv(status);
    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="pcg-enquiries-${stamp}.csv"`);
    res.send('﻿' + csv);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.inquiries.get(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateInquiryDto) {
    return this.inquiries.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.inquiries.remove(id);
  }
}
