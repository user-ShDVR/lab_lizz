import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Морозов Анатолий Игоревич' })
  full_name: string;
  @ApiProperty({ example: '555-7890' })
  @IsOptional()
  phone_number?: string;
  @ApiProperty({ example: '2018-12-12' })
  @IsOptional()
  birth_date?: string;
  @ApiProperty({ example: 'Менеджер' })
  @IsOptional()
  position?: string;
  @ApiProperty({ example: 'ул. Пушкина, д. 7' })
  @IsOptional()
  address?: string;
}
