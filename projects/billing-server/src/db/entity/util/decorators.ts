import { Column, CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

export class ColumnTemplate {
  static RelationUuid(name: string, nullable = false): PropertyDecorator {
    return Column({ type: 'uuid', name, nullable });
  }

  static Date(name: string, nullable: boolean): PropertyDecorator {
    const defaultValue = nullable ? (): string => 'NULL' : (): string => 'CURRENT_TIMESTAMP(3)';
    return Column({ type: 'timestamptz', name, precision: 3, default: defaultValue, nullable });
  }

  static CreateDate(name: string): PropertyDecorator {
    return CreateDateColumn({ type: 'timestamptz', name, precision: 3, default: () => 'CURRENT_TIMESTAMP(3)', nullable: false });
  }

  static UpdateDate(name: string): PropertyDecorator {
    return UpdateDateColumn({ type: 'timestamptz', name, precision: 3, default: () => 'CURRENT_TIMESTAMP(3)', onUpdate: 'CURRENT_TIMESTAMP(3)', nullable: false });
  }

  static DeleteDate(name: string): PropertyDecorator {
    return DeleteDateColumn({ type: 'timestamptz', name, precision: 3, default: () => 'NULL', nullable: true });
  }
}
