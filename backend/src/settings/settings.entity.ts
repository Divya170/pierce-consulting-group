import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/** Singleton row (id = 1): contact details + every feature flag from the design comp. */
@Entity('settings')
export class Settings {
  @PrimaryColumn({ type: 'integer' })
  id: number;

  @Column({ default: 'Weston Pierce' })
  contactName: string;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', nullable: true })
  address: string | null;

  /** design prop `showAddress` (default false) */
  @Column({ default: false })
  showAddress: boolean;

  /** design prop `heroRotate` (default true) — auto-cycle the home Challenge Map */
  @Column({ default: true })
  heroRotate: boolean;

  /** design prop `templatePreview` (default false) — show sample insights/team/industries */
  @Column({ default: false })
  templatePreview: boolean;

  @Column({ type: 'text', default: '' })
  privacyPolicy: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
