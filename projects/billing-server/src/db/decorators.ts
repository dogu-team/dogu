import { Column, CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

export interface DateOptions {
  /**
   * @default false
   */
  nullable?: boolean;
}

function mergeDateOptions(options?: DateOptions): Required<DateOptions> {
  return {
    nullable: false,
    ...options,
  };
}

export function DateColumn(options?: DateOptions): PropertyDecorator {
  const { nullable } = mergeDateOptions(options);
  const defaultValue = nullable ? (): string => 'NULL' : (): string => 'CURRENT_TIMESTAMP(3)';
  return Column({ type: 'timestamptz', precision: 3, default: defaultValue, nullable });
}

export function CreatedAt(): PropertyDecorator {
  return CreateDateColumn({ type: 'timestamptz', precision: 3, default: () => 'CURRENT_TIMESTAMP(3)', nullable: false });
}

export function UpdatedAt(): PropertyDecorator {
  return UpdateDateColumn({ type: 'timestamptz', precision: 3, default: () => 'CURRENT_TIMESTAMP(3)', onUpdate: 'CURRENT_TIMESTAMP(3)', nullable: false });
}

export function DeletedAt(): PropertyDecorator {
  return DeleteDateColumn({ type: 'timestamptz', precision: 3, default: () => 'NULL', nullable: true });
}
