import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PledgesService } from './pledges.service';
import { CreatePledgeDto } from './dto/create-pledge.dto';
import { UpdatePledgeDto } from './dto/update-pledge.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('pledges')
@ApiTags('Pledges')
export class PledgesController {
  constructor(private readonly pledgesService: PledgesService) {}

  @Post()
  create(@Body() createPledgeDto: CreatePledgeDto) {
    return this.pledgesService.create(createPledgeDto);
  }

  @Get()
  findAll() {
    return this.pledgesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pledgesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePledgeDto: UpdatePledgeDto) {
    return this.pledgesService.update(+id, updatePledgeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pledgesService.remove(+id);
  }
}
