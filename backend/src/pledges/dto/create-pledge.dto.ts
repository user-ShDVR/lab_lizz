import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreatePledgeDto {
  @ApiProperty({ example: 'Отличное' })
  @IsOptional()
  condition: string;
  @ApiProperty({ example: 'Алмазное кольцо' })
  @IsOptional()
  description?: string;
  @ApiProperty({ example: 'Вес: 4г' })
  @IsOptional()
  characteristics?: string;
  @ApiProperty({ example: 2000.0 })
  @IsOptional()
  price?: number;
}
