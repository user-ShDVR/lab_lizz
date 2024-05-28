import { Module } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { WarehouseController } from './warehouse.controller';
import { PrismaService } from 'src/utils/prisma.service';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [WarehouseController],
  providers: [WarehouseService, PrismaService, UserService],
})
export class WarehouseModule {}
