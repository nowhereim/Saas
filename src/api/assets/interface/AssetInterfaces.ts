import { OmitType } from '@nestjs/mapped-types';
import { Asset } from '../entities/asset.entity';

export class createRest extends OmitType(Asset, [
  'id',
  'identifier',
] as const) {}
