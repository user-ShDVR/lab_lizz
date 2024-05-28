import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaService } from 'src/utils/prisma.service';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService, PrismaService, UserService],
})
export class ProductModule {}
