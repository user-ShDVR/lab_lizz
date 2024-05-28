import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCheckDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  productQuantity: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  distributorId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  dilerId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  makerId?: number;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  price: number;

  @ApiProperty({ example: 'SALE' })
  @IsString()
  @IsNotEmpty()
  type: any;
}
