import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { ApiTags } from '@nestjs/swagger';
import { ContractsService } from './dto/contracts.service';

@Controller('contracts')
@ApiTags('Contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  create(@Body() createContractDto: CreateContractDto) {
    return this.contractsService.create(createContractDto);
  }
  @ApiTags('Лаба 6.2/Contracts')
  @Get()
  findAll(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return this.contractsService.findAll(startDate, endDate);
  }

  @ApiTags('Лаба 6.2 Min/Contracts')
  @Get('min')
  findAllMin(@Query('startDate') startDate: Date) {
    return this.contractsService.findAllMin(startDate);
  }

  @ApiTags('Лаба 6.2 Max/Contracts')
  @Get('max')
  findAllMax(@Query('startDate') startDate: Date) {
    return this.contractsService.findAllMax(startDate);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contractsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateContractDto: UpdateContractDto,
  ) {
    return this.contractsService.update(+id, updateContractDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contractsService.remove(+id);
  }
}
