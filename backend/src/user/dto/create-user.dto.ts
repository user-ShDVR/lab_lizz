import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'NAME-OF-COMPANY' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  companyName: string;

  @ApiProperty({ example: 'Мира 31' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  legalAddress: string;

  @ApiProperty({ example: '+79223451987' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  contactNumber: string;

  @ApiProperty({ example: 'Georgia' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(20)
  country?: string;

  @ApiProperty({ example: '654646373747867675656362386' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  paymentAccount: string;

  @ApiProperty({ example: '123456789' })
  @IsString()
  @IsNotEmpty()
  @MinLength(9)
  @MaxLength(10)
  BIK: string;

  @ApiProperty({ example: '654646373' })
  @IsString()
  @IsNotEmpty()
  @Length(9)
  KPP: string;

  @ApiProperty({ example: '6546463775' })
  @IsString()
  @IsNotEmpty()
  @Length(10)
  INN: string;

  @ApiProperty({ example: 'DILER' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  role: any;
}
