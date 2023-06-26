import { Platform } from '@dogu-private/types';
import { ContextPageSource } from '@dogu-tech/device-client-common';
import { Transform, Type } from 'class-transformer';

import { AppiumRotation, GamiumRotation } from '../utils/streaming/inspector';

export interface InspectNode<A> {
  tag: string;
  attributes: A;
  key: string;
  title: string;
  children?: InspectNode<A>[];
}

export type AndroidInspectorNode = InspectNode<AndroidNodeAttributes>;
export type GamiumInspectorNode = InspectNode<GamiumNodeAttributes>;
export type IosInspectorNode = InspectNode<IosNodeAttributes>;

export type InspectorWorkerMessage = {
  type: 'convert';
  result: ContextPageSource[];
  platform: Platform;
};

export type InspectorWorkerResponse<A> = Pick<ContextAndNode<A>, 'context' | 'node'>;

export type InspectNodeWithPosition<A> = {
  node: InspectNode<A>;
  position: SelectedNodePosition;
};

export interface ContextAndNode<A> {
  context: Pick<ContextPageSource, 'context'>['context'];
  android: Pick<ContextPageSource, 'android'>['android'];
  screenSize: Pick<ContextPageSource, 'screenSize'>['screenSize'];
  node: InspectNode<A>;
}

export type SelectedNodePosition = {
  x: number;
  y: number;
  width: number;
  height: number;
};

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
  index: number = 0;

  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true')
  checkable?: boolean;

  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true')
  checked?: boolean;

  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true')
  clickable?: boolean;

  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true')
  enabled?: boolean;

  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true')
  focusable?: boolean;

  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true')
  focused?: boolean;

  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true')
  'long-clickable'?: boolean;

  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true')
  scrollable?: boolean;

  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true')
  selected?: boolean;

  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true')
  displayed?: boolean;

  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true')
  password?: string;

  @Type(() => ScreenPosition)
  @Transform(({ value }) => {
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

export type AndroidAttributeFields = keyof AndroidNodeAttributes;

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
  index?: number;

  @Type(() => GameObjectScreenPosition)
  @Transform(({ value }) => {
    const regex = /-?\d+(\.\d+)?/g;
    const matches = value.match(regex);
    if (matches) {
      const [x, y] = matches;
      return { x: Number(x), y: Number(y) };
    }
  })
  ['screen-position']?: GameObjectScreenPosition;

  @Type(() => GameObjectScreenRectSize)
  @Transform(({ value }) => {
    const regex = /-?\d+(\.\d+)?/g;
    const matches = value.match(regex);
    if (matches) {
      const [width, height] = matches;
      return { width: Number(width), height: Number(height) };
    }
  })
  ['screen-rect-size']?: GameObjectScreenRectSize;

  @Type(() => GameObjectPosition)
  @Transform(({ value }) => {
    const regex = /-?\d+(\.\d+)?/g;
    const matches = value.match(regex);
    if (matches) {
      const [x, y, z] = matches;
      return { x: Number(x), y: Number(y), z: Number(z) };
    }
  })
  position?: GameObjectPosition;

  @Type(() => GameObjectRotation)
  @Transform(({ value }) => {
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

export type GamiumAttributeFields = keyof GamiumNodeAttributes;

export type InspectNodeAttributes = AndroidNodeAttributes | GamiumNodeAttributes | IosNodeAttributes;

export class IosNodeAttributes {
  @Type(() => Number)
  index: number = 0;

  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true')
  accessible?: boolean;

  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true')
  enabled?: boolean;

  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true')
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
