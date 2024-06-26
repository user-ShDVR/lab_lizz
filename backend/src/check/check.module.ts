import { Module } from '@nestjs/common';
import { CheckService } from './check.service';
import { CheckController } from './check.controller';
import { PrismaService } from 'src/utils/prisma.service';
import { UserService } from 'src/user/user.service';
import { GeneratePdfService } from 'src/utils/generate-pdf.service';

@Module({
  controllers: [CheckController],
  providers: [CheckService, PrismaService, UserService, GeneratePdfService],
})
export class CheckModule {}
