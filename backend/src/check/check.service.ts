import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCheckDto } from './dto/create-check.dto';
import { UpdateCheckDto } from './dto/update-check.dto';
import { PrismaService } from 'src/utils/prisma.service';
import { UserService } from 'src/user/user.service';
import { ProductService } from 'src/product/product.service';
import { GeneratePdfService } from 'src/utils/generate-pdf.service';
import { CheckType } from '@prisma/client';

@Injectable()
export class CheckService {
  constructor(
    private db: PrismaService,
    private productService: ProductService,
    private userService: UserService,
    private generatePdfService: GeneratePdfService,
  ) {}
  async deductProductQuantity(
    productId: number,
    quantityToDeduct: number,
  ): Promise<void> {
    const warehouseProducts = await this.db.warehouseProduct.findMany({
      where: { productId: productId },
    });
    console.log(warehouseProducts);

    let remainingQuantityToDeduct = quantityToDeduct;

    for (const warehouseProduct of warehouseProducts) {
      if (remainingQuantityToDeduct <= 0) {
        break;
      }

      const currentQuantity = warehouseProduct.quantity;

      if (currentQuantity > remainingQuantityToDeduct) {
        await this.db.warehouseProduct.update({
          where: { id: warehouseProduct.id },
          data: { quantity: currentQuantity - remainingQuantityToDeduct },
        });
        remainingQuantityToDeduct = 0;
      } else {
        await this.db.warehouseProduct.delete({
          where: { id: warehouseProduct.id },
        });
        remainingQuantityToDeduct -= currentQuantity;
      }
    }

    if (remainingQuantityToDeduct > 0) {
      throw new BadRequestException(
        'Недостаточно продуктов на складе для выполнения вычитания',
      );
    }

    // Обновляем количество продуктов
    const product = await this.db.product.findUnique({
      where: { id: productId, deleted: false },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const updatedQuantity = product.quantity - quantityToDeduct;

    await this.db.product.update({
      where: { id: productId },
      data: { quantity: updatedQuantity },
    });
  }
  async create(createCheckDto: CreateCheckDto) {
    if (createCheckDto.type !== 'SALE' && createCheckDto.type !== 'RECEPTION') {
      throw new BadRequestException('Чек типа RECEPTION или SALE');
    }
    if (createCheckDto.type === 'SALE' && !createCheckDto.dilerId) {
      throw new BadRequestException('Укажите Дилера');
    }

    if (createCheckDto.type === 'RECEPTION' && !createCheckDto.makerId) {
      throw new BadRequestException('Укажите Производителя');
    }

    if (createCheckDto.type === 'SALE' && !createCheckDto.price) {
      throw new BadRequestException('Укажите Цену');
    }
    const promises = [
      this.userService.findOne(createCheckDto.distributorId),
      this.userService.findOne(createCheckDto.dilerId),
      createCheckDto.makerId
        ? this.userService.findOne(createCheckDto.makerId)
        : Promise.resolve(null),
      this.productService.findOne(createCheckDto.productId),
    ];

    const [distributor, diler, maker, product] = await Promise.all(promises);

    if (distributor.role !== 'DISTRIBUTOR') {
      throw new BadRequestException('User is not a DISTRIBUTOR');
    }
    if (createCheckDto.dilerId && diler && diler.role !== 'DILER') {
      throw new BadRequestException('User is not a DILER');
    }
    if (createCheckDto.makerId && maker && maker.role !== 'MAKER') {
      throw new BadRequestException('User is not a MAKER');
    }

    if (createCheckDto.makerId) {
      const product = await this.db.product.findFirst({
        where: {
          id: createCheckDto.productId,
          ownerId: createCheckDto.makerId,
          deleted: false,
        },
      });

      if (!product) {
        throw new BadRequestException(
          'Продукт не принадлежит данному производителю',
        );
      }

      if (product.quantity < createCheckDto.productQuantity) {
        throw new BadRequestException(
          'У производиетеля нет такого количества этого продукта',
        );
      }

      if (product.quantity > createCheckDto.productQuantity) {
        const quantity = product.quantity - createCheckDto.productQuantity;
        await this.db.product.update({
          where: { id: product.id },
          data: { quantity: quantity },
        });
        const characteristics = await this.db.characteristic.findMany({
          where: { productId: product.id },
        });
        await this.db.product.create({
          data: {
            makerId: createCheckDto.makerId,
            name: product.name,
            price: product.price,
            quantity: createCheckDto.productQuantity,
            ownerId: createCheckDto.distributorId,
            characteristics: {
              create: characteristics.map((char) => ({
                name: char.name,
                value: char.value,
                rowKey: char.rowKey,
              })),
            },
          },
        });
      }
      if (product.quantity === createCheckDto.productQuantity) {
        await this.db.product.update({
          where: { id: product.id },
          data: { ownerId: createCheckDto.distributorId },
        });
      }
      const warehouse = await this.db.warehouse.findFirst({
        where: { distributorId: createCheckDto.distributorId },
      });
      if (!warehouse) {
        throw new BadRequestException('Warehouse not found');
      }
      await this.db.warehouseProduct.create({
        data: {
          productId: product.id,
          quantity: createCheckDto.productQuantity,
          warehouseId: warehouse.id,
          price: createCheckDto.price,
        },
      });
    }

    if (createCheckDto.dilerId) {
      const product = await this.db.product.findFirst({
        where: {
          id: createCheckDto.productId,
          ownerId: createCheckDto.distributorId,
          deleted: false,
        },
      });

      if (!product) {
        throw new NotFoundException('Product with that owner not found');
      }

      if (product.quantity < createCheckDto.productQuantity) {
        throw new BadRequestException(
          'У склада нет такого количества этого продукта',
        );
      }

      if (product.quantity > createCheckDto.productQuantity) {
        const quantity = product.quantity - createCheckDto.productQuantity;
        const updProd = await this.db.product.update({
          where: { id: product.id },
          data: { quantity: quantity },
        });
        const characteristics = await this.db.characteristic.findMany({
          where: { productId: product.id },
        });
        await this.db.product.create({
          data: {
            makerId: updProd.makerId,
            name: product.name,
            price: product.price,
            quantity: createCheckDto.productQuantity,
            ownerId: createCheckDto.dilerId,
            characteristics: {
              create: characteristics.map((char) => ({
                name: char.name,
                value: char.value,
                rowKey: char.rowKey,
              })),
            },
          },
        });
      }

      if (product.quantity === createCheckDto.productQuantity) {
        await this.db.product.update({
          where: { id: product.id },
          data: { ownerId: createCheckDto.distributorId },
        });
      }
      await this.deductProductQuantity(
        product.id,
        createCheckDto.productQuantity,
      );
    }

    const summary = product.price * createCheckDto.productQuantity;

    const check = await this.db.check.create({
      data: {
        productQuantity: createCheckDto.productQuantity,
        productId: createCheckDto.productId,
        type: createCheckDto.type,
        distributorId: createCheckDto.distributorId,
        dilerId: createCheckDto.dilerId,
        makerId: createCheckDto.makerId,
        summary: summary,
      },
    });

    await this.generatePdfService.generatePDF(check.id);

    return check;
  }

  async findAll(checkType: string) {
    return await this.db.check.findMany({
      where: { type: CheckType[checkType] },
      include: { maker: true, diler: true, distributor: true },
    });
  }

  async findOne(id: number) {
    const check = await this.db.check.findFirst({ where: { id } });
    if (!check) {
      throw new NotFoundException('Check not found');
    }
    return check;
  }

  async update(id: number, updateCheckDto: UpdateCheckDto) {
    if (
      updateCheckDto &&
      updateCheckDto.type !== 'SALE' &&
      updateCheckDto.type !== 'RECEPTION'
    ) {
      throw new BadRequestException('Check type must be SALE or RECEPTION');
    }
    const check = await this.findOne(id);

    const roleChecks = [];

    if (
      updateCheckDto.productId &&
      updateCheckDto.productId != check.productId
    ) {
      roleChecks.push(this.productService.findOne(updateCheckDto.productId));
    }

    if (updateCheckDto.makerId && updateCheckDto.makerId != check.makerId) {
      roleChecks.push(
        this.userService.findOne(updateCheckDto.makerId).then((user) => {
          if (user.role != 'MAKER') {
            throw new BadRequestException('User is not a MAKER');
          }
        }),
      );
    }

    if (updateCheckDto.dilerId && updateCheckDto.dilerId != check.dilerId) {
      roleChecks.push(
        this.userService.findOne(updateCheckDto.dilerId).then((user) => {
          if (user.role != 'DILER') {
            throw new BadRequestException('User is not a DILER');
          }
        }),
      );
    }

    if (
      updateCheckDto.distributorId &&
      updateCheckDto.distributorId != check.distributorId
    ) {
      roleChecks.push(
        this.userService.findOne(updateCheckDto.distributorId).then((user) => {
          if (user.role != 'DISTRIBUTOR') {
            throw new BadRequestException('User is not a DISTRIBUTOR');
          }
        }),
      );
    }

    await Promise.all(roleChecks);

    return await this.db.check.update({ where: { id }, data: updateCheckDto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.db.check.delete({ where: { id } });
  }
}
