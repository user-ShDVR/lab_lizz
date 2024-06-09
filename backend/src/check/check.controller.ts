import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CheckService } from './check.service';
import { CreateCheckDto } from './dto/create-check.dto';
import { ApiTags } from '@nestjs/swagger';
import { CheckType } from '@prisma/client';
import { CreateDistCheckDto } from './dto/create-Dcheck.dto';
@ApiTags('check')
@Controller('check')
export class CheckController {
  constructor(private readonly checkService: CheckService) {}

  @Post()
  create(@Body() createCheckDto: CreateCheckDto) {
    return this.checkService.create(createCheckDto);
  }

  @Post('dist')
  createDist(@Body() createCheckDto: CreateDistCheckDto) {
    return this.checkService.createDistCheck(createCheckDto);
  }

  @Get()
  findAll(@Query('type') type: CheckType) {
    return this.checkService.findAll(type);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.checkService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.checkService.remove(+id);
  }
}
