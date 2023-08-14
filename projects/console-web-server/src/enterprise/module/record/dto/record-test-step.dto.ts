import { CreateRecordTestActionWebdriverClickDtoBase, CreateRecordTestActionWebdriverInputDtoBase, CreateRecordTestStepDtoBase, RecordTestActionBase } from '@dogu-private/console';
import { RecordTestActionType, RecordTestActionTypes, RecordTestStepId } from '@dogu-private/types';
import { Type } from 'class-transformer';
import { Equals, IsIn, IsNumber, IsString, IsUUID, ValidateIf, ValidateNested } from 'class-validator';

export class RecordTestAction implements RecordTestActionBase {
  @IsIn(RecordTestActionTypes)
  type!: RecordTestActionType;
}

export class CreateRecordTestActionWebdriverClickDto extends RecordTestAction implements CreateRecordTestActionWebdriverClickDtoBase {
  @Equals('WEBDRIVER_CLICK')
  declare type: 'WEBDRIVER_CLICK';
  @IsNumber()
  videoScreenPositionX!: number;
  @IsNumber()
  videoScreenPositionY!: number;
  @IsNumber()
  videoScreenSizeX!: number;
  @IsNumber()
  videoScreenSizeY!: number;
}

export class CreateRecordTestActionWebdriverInputDto extends RecordTestAction implements CreateRecordTestActionWebdriverInputDtoBase {
  @Equals('WEBDRIVER_INPUT')
  declare type: 'WEBDRIVER_INPUT';
  @IsString()
  value!: string;
}

export class CreateRecordTestStepDto implements CreateRecordTestStepDtoBase {
  @IsUUID()
  @ValidateIf((object, value) => value !== null)
  prevRecordTestStepId!: RecordTestStepId | null;

  @ValidateNested()
  @Type(() => RecordTestAction, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: CreateRecordTestActionWebdriverClickDto, name: 'WEBDRIVER_CLICK' },
        { value: CreateRecordTestActionWebdriverInputDto, name: 'WEBDRIVER_INPUT' },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  actionInfo!: CreateRecordTestActionWebdriverClickDto | CreateRecordTestActionWebdriverInputDto;
}
