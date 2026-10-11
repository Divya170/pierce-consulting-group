import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export interface ArticleBlock {
  type: 'h' | 'p';
  text: string;
}

export const INSIGHT_STATUSES = ['draft', 'published'] as const;
export type InsightStatus = (typeof INSIGHT_STATUSES)[number];

@Entity('insights')
export class Insight {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column()
  category: string;

  /** Related service slug (aside link + consultation pre-selection) */
  @Column({ type: 'varchar', nullable: true })
  serviceSlug: string | null;

  @Column({ type: 'varchar', nullable: true })
  image: string | null;

  @Column({ type: 'text', default: '' })
  excerpt: string;

  @Column({ type: 'simple-json' })
  body: ArticleBlock[];

  @Column({ type: 'varchar', nullable: true })
  author: string | null;

  @Column({ type: 'varchar', default: 'draft' })
  status: InsightStatus;

  @Column({ default: false })
  featured: boolean;

  /** Template sample from the design comp — visible only with settings.templatePreview */
  @Column({ default: false })
  isSample: boolean;

  @Column({ type: 'datetime', nullable: true })
  publishedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
