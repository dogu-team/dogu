import { IsNumber, IsOptional } from 'class-validator';

/**
 * @property {number|string} longitude - Valid longitude value.
 * @property {number|string} latitude - Valid latitude value.
 * @property {?number|string} [altitude] - Valid altitude value.
 * @property {?number|string} [satellites=12] - Number of satellites being tracked (1-12).
 * @property {?number|string} [speed] - Valid speed value.
 */
export interface GeoLocation {
  longitude: number;
  latitude: number;
  altitude?: number;
  satellites?: number;
  speed?: number;
}

export class GeoLocationDto implements GeoLocation {
  @IsNumber()
  longitude!: number;

  @IsNumber()
  latitude!: number;

  @IsNumber()
  @IsOptional()
  altitude?: number;

  @IsNumber()
  @IsOptional()
  satellites?: number;

  @IsNumber()
  @IsOptional()
  speed?: number;
}
