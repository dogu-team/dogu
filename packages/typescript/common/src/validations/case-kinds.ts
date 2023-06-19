import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { Class } from './types';

export interface CaseHavable {
  $case: string;
}

export class Caseable<T extends string = ''> implements CaseHavable {
  static $case = '$case';

  @IsString()
  @IsNotEmpty()
  $case!: T;
}

export function TransformByCase<T extends Class<T> & CaseHavable>(subTypes: readonly T[]): PropertyDecorator {
  return Type(() => Caseable, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: Caseable.$case,
      subTypes: subTypes.map((subType) => {
        return {
          name: subType.$case,
          value: subType,
        };
      }),
    },
  });
}

export interface KindHavable {
  kind: string;
}

export class Kindable<T extends string = ''> implements KindHavable {
  static kind = 'kind';

  @IsString()
  @IsNotEmpty()
  kind!: T;
}

export function TransformByKind<T extends Class<T> & KindHavable>(subTypes: readonly T[]): PropertyDecorator {
  return Type(() => Kindable, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: Kindable.kind,
      subTypes: subTypes.map((subType) => {
        return {
          name: subType.kind,
          value: subType,
        };
      }),
    },
  });
}

const defaultContainerForOneOf = new Set<string>();

export function OneOf(namespace?: string, container = defaultContainerForOneOf): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (target: Function): void => {
    const name = namespace ? `${namespace}.${target.name}` : target.name;
    container.add(name);
  };
}
