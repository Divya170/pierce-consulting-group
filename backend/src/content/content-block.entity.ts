import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/**
 * One polymorphic table for every simple CMS collection on the site
 * (FAQ, stages, challenges, audiences, principles, team members, …).
 * `type` is the discriminator; `fields` holds the type-specific values
 * validated against CONTENT_TYPES in content.schemas.ts.
 */
@Entity('content_blocks')
@Index(['type', 'sortOrder'])
export class ContentBlock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ type: 'simple-json' })
  fields: Record<string, unknown>;

  @Column({ default: true })
  published: boolean;

  /** Sample/template rows from the design comp — shown only when settings.templatePreview is on. */
  @Column({ default: false })
  isSample: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
