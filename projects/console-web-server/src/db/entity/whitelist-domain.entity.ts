import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('whitelist_domain')
export class WhitelistDomain extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'character varying', name: 'domain', length: 255, unique: true })
  domain!: string;
}
