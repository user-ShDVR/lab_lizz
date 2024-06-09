import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CheckType } from '@prisma/client';

class SupplyProductDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @IsInt()
  @IsOptional()
  price?: number;
}

export class CreateDistCheckDto {
  @IsEnum(CheckType)
  @IsNotEmpty()
  type: CheckType;

  @IsInt()
  @IsNotEmpty()
  distributorId: number;

  @IsInt()
  @IsOptional()
  dilerId?: number;

  @IsInt()
  @IsOptional()
  makerId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SupplyProductDto)
  @IsNotEmpty()
  supplyProducts: SupplyProductDto[];

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  date: Date;

  @IsInt()
  @IsNotEmpty()
  warehouseId: number;
}
