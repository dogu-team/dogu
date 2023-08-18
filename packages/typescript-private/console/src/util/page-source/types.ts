import { TransformBooleanString } from '@dogu-tech/common';
import { ContextPageSource, ScreenSize } from '@dogu-tech/device-client-common';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export const GAMIUM_CONTEXT_KEY = 'GAMIUM';

export interface ParsedNode<A> {
  tag: string;
  attributes: A;
  key: string;
  title: string;
  children?: ParsedNode<A>[];
}

export type AndroidNode = ParsedNode<AndroidNodeAttributes>;
export type GamiumNode = ParsedNode<GamiumNodeAttributes>;
export type IosNode = ParsedNode<IosNodeAttributes>;

export type NodeWithPosition<A> = {
  node: ParsedNode<A>;
  position: NodePosition;
};

export interface ContextNode<A> extends Omit<ContextPageSource, 'pageSource'> {
  node: ParsedNode<A>;
}

export type NodePosition = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export class ScreenPosition {
  start!: [number, number];
  end!: [number, number];
}

export class AndroidNodeAttributes {
  @Type(() => Number)
  rotation?: AppiumRotation;

  @Type(() => Number)
  height?: number;

  @Type(() => Number)
  width?: number;

  @Type(() => Number)
  index = 0;

  @IsBoolean()
  @TransformBooleanString()
  @IsOptional()
  checkable?: boolean;

  @IsBoolean()
  @TransformBooleanString()
  @IsOptional()
  checked?: boolean;

  @IsBoolean()
  @TransformBooleanString()
  @IsOptional()
  clickable?: boolean;

  @IsBoolean()
  @TransformBooleanString()
  @IsOptional()
  enabled?: boolean;

  @IsBoolean()
  @TransformBooleanString()
  @IsOptional()
  focusable?: boolean;

  @IsBoolean()
  @TransformBooleanString()
  @IsOptional()
  focused?: boolean;

  @IsBoolean()
  @TransformBooleanString()
  @IsOptional()
  'long-clickable'?: boolean;

  @IsBoolean()
  @TransformBooleanString()
  @IsOptional()
  scrollable?: boolean;

  @IsBoolean()
  @TransformBooleanString()
  @IsOptional()
  selected?: boolean;

  @IsBoolean()
  @TransformBooleanString()
  @IsOptional()
  displayed?: boolean;

  @IsString()
  @IsOptional()
  password?: string;

  @Type(() => ScreenPosition)
  @Transform(({ value }: { value: string }) => {
    const regex = /\[(\d+),(\d+)\]\[(\d+),(\d+)\]/;
    const matches = value.match(regex);
    if (matches) {
      const [, startX, startY, endX, endY] = matches;
      return { start: [Number(startX), Number(startY)], end: [Number(endX), Number(endY)] };
    }
  })
  bounds?: ScreenPosition;

  name?: string;
  package?: string;
  class?: string;
  text?: string;
  'resource-id'?: string;
  'content-desc'?: string;
  path?: string;
}

export type AndroidNodeAttributeFields = keyof AndroidNodeAttributes;

export class GameObjectScreenPosition {
  x!: number;
  y!: number;
}

export class GameObjectScreenRectSize {
  width!: number;
  height!: number;
}

export class GameObjectPosition {
  x!: number;
  y!: number;
  z!: number;
}

export class GameObjectRotation {
  x!: number;
  y!: number;
  z!: number;
  w!: number;
}

export class GamiumNodeAttributes {
  @Type(() => Number)
  width?: number;

  @Type(() => Number)
  height?: number;

  orientation?: GamiumRotation;

  @Type(() => Number)
  index = 0;

  @Type(() => GameObjectScreenPosition)
  @Transform(({ value }: { value: string }) => {
    const regex = /-?\d+(\.\d+)?/g;
    const matches = value.match(regex);
    if (matches) {
      const [x, y] = matches;
      return { x: Number(x), y: Number(y) };
    }
  })
  ['screen-position']?: GameObjectScreenPosition;

  @Type(() => GameObjectScreenRectSize)
  @Transform(({ value }: { value: string }) => {
    const regex = /-?\d+(\.\d+)?/g;
    const matches = value.match(regex);
    if (matches) {
      const [width, height] = matches;
      return { width: Number(width), height: Number(height) };
    }
  })
  ['screen-rect-size']?: GameObjectScreenRectSize;

  @Type(() => GameObjectPosition)
  @Transform(({ value }: { value: string }) => {
    const regex = /-?\d+(\.\d+)?/g;
    const matches = value.match(regex);
    if (matches) {
      const [x, y, z] = matches;
      return { x: Number(x), y: Number(y), z: Number(z) };
    }
  })
  position?: GameObjectPosition;

  @Type(() => GameObjectRotation)
  @Transform(({ value }: { value: string }) => {
    const regex = /-?\d+(\.\d+)?/g;
    const matches = value.match(regex);
    if (matches) {
      const [x, y, z, w] = matches;
      return { x: Number(x), y: Number(y), z: Number(z), w: Number(w) };
    }
  })
  rotation?: GameObjectRotation;

  name?: string;
  path?: string;
  text?: string;
}

export type GamiumNodeAttributeFields = keyof GamiumNodeAttributes;

export class IosNodeAttributes {
  @Type(() => Number)
  index = 0;

  @IsBoolean()
  @TransformBooleanString()
  @IsOptional()
  accessible?: boolean;

  @IsBoolean()
  @TransformBooleanString()
  @IsOptional()
  enabled?: boolean;

  @IsBoolean()
  @TransformBooleanString()
  @IsOptional()
  visible?: boolean;

  @Type(() => Number)
  x?: number;

  @Type(() => Number)
  y?: number;

  @Type(() => Number)
  width?: number;

  @Type(() => Number)
  height?: number;

  type?: string;
  name?: string;
  label?: string;
  path?: string;
}

export type IosNodeAttributeFields = keyof IosNodeAttributes;

export type NodeAttributes = AndroidNodeAttributes | GamiumNodeAttributes | IosNodeAttributes;

export enum AppiumRotation {
  PORTRAIT = 0,
  LANDSCAPE_LEFT = 1,
  PORTRAIT_UPSIDE_DOWN = 2,
  LANDSCAPE_RIGHT = 3,
}

export enum GamiumRotation {
  PORTRAIT = 'Portrait',
  LANDSCAPE_LEFT = 'LandscapeLeft',
  LANDSCAPE_RIGHT = 'LandscapeRight',
  PORTRAIT_UPSIDE_DOWN = 'PortraitUpsideDown',
  AUTO_ROTATION = 'AutoRotation',
}

export enum DeviceRotationDirection {
  TOP_DOWN,
  LEFT,
  UPSIDE_DOWN,
  RIGHT,
}

export type GetInspectingAreaFunc = () => NodePosition;
export type GetNodeBoundFunc<A> = (node: ParsedNode<A>) => NodePosition;
export type GetDeviceScreenSizeFunc = () => ScreenSize;
export type GetDeviceRotationFunc = () => DeviceRotationDirection;

export abstract class NodeUtilizer<A> {
  protected contextAndNode: ContextNode<A>;

  constructor(contextAndNode: ContextNode<A>) {
    this.contextAndNode = contextAndNode;
  }

  abstract getInspectingArea: GetInspectingAreaFunc;
  abstract getNodeBound: GetNodeBoundFunc<A>;
  abstract getDeviceRotation: GetDeviceRotationFunc;
  abstract getDeviceScreenSize: GetDeviceScreenSizeFunc;
  abstract getNodesByPosition: GetNodesByPositionFunc<A>;
}

// index is same tagName index
export type GetXPathFunc = (element: Element, parentPath: string, index?: number) => string;
export type ConvertElementToNodeFunc<A> = (element: Element, parentNode?: ParsedNode<A>, index?: number) => ParsedNode<A>;
export type ParseToNodeFunc<A> = () => ParsedNode<A>;
export type ParseToContextNodeFunc<A> = () => ContextNode<A>;
export type GetNodesByPositionFunc<A> = (x: number, y: number) => ParsedNode<A>[];

export abstract class PageSourceParser<A> {
  protected rootElement: Element;

  constructor(rootElement: Element) {
    this.rootElement = rootElement;
  }

  protected getChildIndexes: (element: Element) => (number | undefined)[] = (element) => {
    const childTagNames = Array.from(element.childNodes).map((elem) => (elem as Element).tagName);

    const indexMap: { [key: string]: undefined | number } = {};
    const indexes: (number | undefined)[] = Array.from({ length: childTagNames.length });

    for (let i = 0; i < childTagNames.length; i++) {
      const item = childTagNames[i];
      const value = indexMap[item];
      if (value === undefined) {
        indexMap[item] = 1;
      } else {
        if (value === 1) {
          const idx = childTagNames.findIndex((name) => name === item);
          indexes[idx] = 1;
        }
        indexes[i] = value + 1;
        indexMap[item] = value + 1;
      }
    }

    return indexes;
  };

  protected getXpath: GetXPathFunc = (element, parentPath, index) => {
    const currentPath = `${element.tagName}${index === undefined ? '' : `[${index}]`}`;
    if (parentPath === '/') {
      return `${parentPath}${currentPath}`;
    } else {
      return `${parentPath}/${currentPath}`;
    }
  };

  protected abstract convertElementToNode: ConvertElementToNodeFunc<A>;

  abstract parseToNode: ParseToNodeFunc<A>;
}
