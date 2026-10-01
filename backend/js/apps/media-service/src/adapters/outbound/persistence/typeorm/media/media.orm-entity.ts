import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { MediaStatus } from '@roomly/contracts';

@Entity({ name: 'media_objects' })
export class MediaOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'storage_key', type: 'varchar', length: 512, unique: true })
  storageKey!: string;

  @Column({ name: 'content_type', type: 'varchar', length: 128 })
  contentType!: string;

  @Column({ type: 'bigint' })
  size!: string;

  @Column({ name: 'original_name', type: 'varchar', length: 255, nullable: true })
  originalName!: string | null;

  /** ready | processing | failed — processing reserved for future crop/variants */
  @Column({ type: 'varchar', length: 32, default: 'ready' })
  status!: MediaStatus;

  @Column({ name: 'owner_id', type: 'uuid', nullable: true })
  ownerId!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
