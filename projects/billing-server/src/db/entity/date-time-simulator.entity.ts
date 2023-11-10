import { propertiesOf } from '@dogu-tech/common';
import { IsNumber } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export const DateTimeSimulatorTableName = 'date_time_simulator';

@Entity(DateTimeSimulatorTableName)
export class DateTimeSimulator {
  @PrimaryGeneratedColumn()
  @IsNumber()
  dateTimeSimulatorId: number = 0;

  @Column({ type: 'integer', default: 0 })
  @IsNumber()
  yearsOffset: number = 0;

  @Column({ type: 'integer', default: 0 })
  @IsNumber()
  monthsOffset: number = 0;

  @Column({ type: 'integer', default: 0 })
  @IsNumber()
  daysOffset: number = 0;

  @Column({ type: 'integer', default: 0 })
  @IsNumber()
  hoursOffset: number = 0;

  @Column({ type: 'integer', default: 0 })
  @IsNumber()
  minutesOffset: number = 0;

  @Column({ type: 'integer', default: 0 })
  @IsNumber()
  secondsOffset: number = 0;

  @Column({ type: 'integer', default: 0 })
  @IsNumber()
  millisecondsOffset: number = 0;
}

export const DateTimeSimulatorProp = propertiesOf<DateTimeSimulator>();
