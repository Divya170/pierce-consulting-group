import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export const INQUIRY_STATUSES = ['new', 'review', 'contacted', 'closed'] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

@Entity('inquiries')
@Index(['status', 'createdAt'])
export class Inquiry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Human-friendly reference shown on the success card, e.g. PCG-7K2Q9D */
  @Column({ unique: true })
  reference: string;

  /** Idempotency key from the client — a retried request never creates a duplicate */
  @Column({ type: 'varchar', unique: true, nullable: true })
  clientRequestId: string | null;

  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column()
  company: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  /** Service slug or "other" */
  @Column()
  serviceInterest: string;

  /** Title snapshot at submission time (survives later service edits/deletes) */
  @Column()
  serviceTitle: string;

  @Column({ type: 'text' })
  challenge: string;

  @Column({ type: 'varchar', nullable: true })
  preferredContact: 'email' | 'phone' | null;

  @Column({ type: 'varchar', default: 'new' })
  status: InquiryStatus;

  @Column({ type: 'text', default: '' })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
