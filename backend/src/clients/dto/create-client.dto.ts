import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ example: 'Сидоров Андрей Петрович' })
  full_name: string;
  @ApiProperty({ example: 'ул. Дзержинского, д.8' })
  @IsOptional()
  address?: string;
  @ApiProperty({ example: '555-1111' })
  @IsOptional()
  phone_number?: string;
  @ApiProperty({ example: 'EF234567' })
  @IsOptional()
  passport_data?: string;
}
