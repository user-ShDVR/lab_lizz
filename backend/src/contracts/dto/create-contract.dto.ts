import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateContractDto {
  @ApiProperty({ example: 'Залог' })
  @IsOptional()
  contract_type?: string;

  @ApiProperty({ example: '2023-12-10' })
  @IsOptional()
  payment_date?: string;

  @ApiProperty({ example: '2023-12-12' })
  @IsOptional()
  termination_date?: string;

  @ApiProperty({ example: 10000 })
  @IsOptional()
  payout_to_client?: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  client_code?: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  pledge_code?: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  employee_code?: number;
}
