import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export const SERVICE_STATUSES = ['published', 'draft', 'awaiting-confirmation'] as const;
export type ServiceStatus = (typeof SERVICE_STATUSES)[number];

/** Which illustrative figure the services page renders next to this service. */
export const SERVICE_VISUALS = ['matrix', 'workflow', 'before-after', 'none'] as const;
export type ServiceVisual = (typeof SERVICE_VISUALS)[number];

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  /** URL id, e.g. "strategy" -> /services/strategy, /contact?service=strategy. Immutable after create. */
  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  /** Short uppercase label on the home bento, e.g. "DIRECTION" */
  @Column({ default: '' })
  kicker: string;

  /** One-line card description on the home page */
  @Column({ type: 'text', default: '' })
  summary: string;

  /** Italic purpose statement (also used on the services summary tiles) */
  @Column({ type: 'text', default: '' })
  purpose: string;

  @Column({ type: 'text', default: '' })
  body: string;

  @Column({ type: 'simple-json' })
  focusAreas: string[];

  @Column({ type: 'varchar', default: 'none' })
  visual: ServiceVisual;

  @Column({ default: '' })
  ctaLabel: string;

  @Column({ type: 'varchar', default: 'draft' })
  status: ServiceStatus;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
