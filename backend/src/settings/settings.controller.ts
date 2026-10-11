import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './settings.dto';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { ServicesService } from '../services/services.service';

@Controller()
export class SettingsController {
  constructor(
    private readonly settings: SettingsService,
    private readonly services: ServicesService,
  ) {}

  /** Bootstrap payload for the public layout: header, menu, footer. */
  @Get('site')
  async site() {
    const [settings, services] = await Promise.all([this.settings.getPublic(), this.services.listPublished()]);
    return { settings, services };
  }

  @Get('settings')
  getPublic() {
    return this.settings.getPublic();
  }

  @Get('settings/admin')
  @UseGuards(JwtAuthGuard)
  getAdmin() {
    return this.settings.get();
  }

  @Patch('settings')
  @UseGuards(JwtAuthGuard)
  update(@Body() dto: UpdateSettingsDto) {
    return this.settings.update(dto);
  }
}
