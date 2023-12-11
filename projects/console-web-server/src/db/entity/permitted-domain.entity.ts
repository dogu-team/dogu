import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('permitted_domain')
export class PermittedDomain extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'character varying', name: 'domain', length: 255, unique: true })
  domain!: string;
}
