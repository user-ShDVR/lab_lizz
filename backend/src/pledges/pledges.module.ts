import { Module } from '@nestjs/common';
import { PledgesService } from './dto/pledges.service';
import { PledgesController } from './pledges.controller';
import { PrismaService } from 'src/utils/prisma.service';

@Module({
  controllers: [PledgesController],
  providers: [PledgesService, PrismaService],
})
export class PledgesModule {}
