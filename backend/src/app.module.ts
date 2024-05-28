import { Module } from '@nestjs/common';
import { WarehouseModule } from './warehouse/warehouse.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { CheckModule } from './check/check.module';

@Module({
  imports: [WarehouseModule, UserModule, ProductModule, CheckModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
