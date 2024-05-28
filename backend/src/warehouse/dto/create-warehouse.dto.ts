import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateWarehouseDto {
  @ApiProperty({ example: 'National Warehouse', description: 'Warehouse name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  name: string;

  @ApiProperty({ example: 'Мира 32', description: 'Warehouse address' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  address: string;

  @ApiProperty({ example: '1' })
  @IsNumber()
  @IsNotEmpty()
  distributorId: number;
}
