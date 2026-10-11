import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from './settings.entity';
import { UpdateSettingsDto } from './settings.dto';
import { telHref } from '../common/utils';

export const DEFAULT_PRIVACY =
  'Our full privacy policy is being finalized and will be published on this page. Information submitted through the consultation form is used to respond to your enquiry.';

@Injectable()
export class SettingsService {
  constructor(@InjectRepository(Settings) private readonly repo: Repository<Settings>) {}

  async ensure(): Promise<Settings> {
    const existing = await this.repo.findOne({ where: { id: 1 } });
    if (existing) return existing;
    return this.repo.save(
      this.repo.create({
        id: 1,
        contactName: 'Weston Pierce',
        email: 'weston.pierce@pierceconsulting.com',
        phone: '+1 (215) 682-2917',
        address: '1 City Hall Plaza, Boston, MA 52201',
        showAddress: false,
        heroRotate: true,
        templatePreview: false,
        privacyPolicy: DEFAULT_PRIVACY,
      }),
    );
  }

  get(): Promise<Settings> {
    return this.ensure();
  }

  /** Shape sent to the public site (adds derived hrefs, hides address unless enabled). */
  async getPublic() {
    const s = await this.ensure();
    return {
      contactName: s.contactName,
      email: s.email,
      phone: s.phone,
      mailHref: s.email ? `mailto:${s.email}` : null,
      telHref: telHref(s.phone),
      address: s.showAddress ? s.address : null,
      showAddress: s.showAddress && !!s.address,
      heroRotate: s.heroRotate,
      templatePreview: s.templatePreview,
      privacyPolicy: s.privacyPolicy,
    };
  }

  async update(dto: UpdateSettingsDto): Promise<Settings> {
    const s = await this.ensure();
    const clean = (v: string | null | undefined) => (v === undefined ? undefined : v === null || v.trim() === '' ? null : v.trim());
    if (dto.contactName !== undefined) s.contactName = dto.contactName.trim();
    const email = clean(dto.email);
    if (email !== undefined) s.email = email ? email.toLowerCase() : null;
    const phone = clean(dto.phone);
    if (phone !== undefined) s.phone = phone;
    const address = clean(dto.address);
    if (address !== undefined) s.address = address;
    if (dto.showAddress !== undefined) s.showAddress = dto.showAddress;
    if (dto.heroRotate !== undefined) s.heroRotate = dto.heroRotate;
    if (dto.templatePreview !== undefined) s.templatePreview = dto.templatePreview;
    if (dto.privacyPolicy !== undefined) s.privacyPolicy = dto.privacyPolicy.trim();
    return this.repo.save(s);
  }
}
