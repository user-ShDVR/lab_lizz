import { Module } from '@nestjs/common';
import { ContractsController } from './contracts.controller';
import { PrismaService } from 'src/utils/prisma.service';
import { GeneratePdfService } from 'src/utils/generate-pdf.service';
import { ContractsService } from './dto/contracts.service';

@Module({
  controllers: [ContractsController],
  providers: [ContractsService, PrismaService, GeneratePdfService],
})
export class ContractsModule {}
