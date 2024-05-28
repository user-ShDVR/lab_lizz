import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator"

export class CreateCheckDto { 
    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    productQuantity: number

    @ApiProperty({ example: 1 })   
    @IsNumber()
    @IsNotEmpty()
    productId: number

    @ApiProperty({ example: 1 })   
    @IsNumber()
    @IsNotEmpty()
    distributorId: number

    @ApiProperty({ example: 1 })   
    @IsNumber()
    @IsNotEmpty()
    @IsOptional()
    dilerId: number

    @ApiProperty({ example: 1 })   
    @IsNumber()
    @IsNotEmpty()
    @IsOptional()
    makerId?: number

    @ApiProperty({ example: "SALE" }) 
    @IsString()
    @IsNotEmpty()
    type: any
}
