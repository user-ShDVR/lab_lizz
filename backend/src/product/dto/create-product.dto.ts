import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'shirt' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  name: string;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  makerId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  ownerId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ example: [{ name: 'color', value: 'red', rowKey: '1' }] })
  @IsArray()
  @IsNotEmpty()
  characteristics: CharacteristicDto[];
}

class CharacteristicDto {
  id?: number;
  name: string;
  value: string;
  rowKey?: string;
}
