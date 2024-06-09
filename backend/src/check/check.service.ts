import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCheckDto } from './dto/create-check.dto';
import { PrismaService } from 'src/utils/prisma.service';
import { UserService } from 'src/user/user.service';
import { GeneratePdfService } from 'src/utils/generate-pdf.service';
import { CheckType } from '@prisma/client';
import { CreateDistCheckDto } from './dto/create-Dcheck.dto';

@Injectable()
export class CheckService {
  constructor(
    private db: PrismaService,
    private userService: UserService,
    private generatePdfService: GeneratePdfService,
  ) {}
  async create(createCheckDto: CreateCheckDto) {
    if (createCheckDto.type !== 'SALE') {
      throw new BadRequestException('The check is not of type SALE');
    }
    if (!createCheckDto.dilerId) {
      throw new BadRequestException(
        'Dealer ID must be specified for SALE type',
      );
    }

    const [distributor, diler] = await Promise.all([
      this.userService.findOne(createCheckDto.distributorId),
      this.userService.findOne(createCheckDto.dilerId),
    ]);

    if (!distributor || distributor.role !== 'DISTRIBUTOR') {
      throw new BadRequestException(
        'Distributor is not valid or does not exist',
      );
    }
    if (!diler || diler.role !== 'DILER') {
      throw new BadRequestException('Dealer is not valid or does not exist');
    }

    const product = await this.db.product.findFirst({
      where: {
        id: createCheckDto.productId,
        ownerId: createCheckDto.distributorId,
        deleted: false,
      },
    });

    if (!product) {
      throw new NotFoundException('Product with the specified owner not found');
    }

    if (product.quantity < createCheckDto.productQuantity) {
      throw new BadRequestException('Insufficient product quantity in stock');
    }
    try {
      await this.db.$transaction(async (prisma) => {
        const remainingQuantity =
          product.quantity - createCheckDto.productQuantity;
        const distributorProfit =
          (createCheckDto.price - product.price) *
          createCheckDto.productQuantity;

        await prisma.user.updateMany({
          where: { id: createCheckDto.distributorId },
          data: { profit: { increment: distributorProfit } },
        });

        await prisma.distributor.updateMany({
          where: { id: createCheckDto.distributorId },
          data: { profit: { increment: distributorProfit } },
        });

        if (remainingQuantity > 0) {
          await prisma.product.update({
            where: { id: product.id },
            data: { quantity: remainingQuantity },
          });

          const characteristics = await prisma.characteristic.findMany({
            where: { productId: product.id },
          });

          await prisma.product.create({
            data: {
              makerId: product.makerId,
              name: product.name,
              price: createCheckDto.price,
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

          await prisma.supplyProduct.updateMany({
            where: { productId: product.id },
            data: { quantity: remainingQuantity },
          });
        } else {
          await prisma.product.update({
            where: { id: product.id },
            data: {
              ownerId: createCheckDto.dilerId,
              price: createCheckDto.price,
            },
          });

          await prisma.supplyProduct.deleteMany({
            where: { productId: product.id },
          });
        }
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Transaction failed',
        error.message,
      );
    }

    const summary = createCheckDto.price * createCheckDto.productQuantity;

    const check = await this.db.check.create({
      data: {
        productQuantity: createCheckDto.productQuantity,
        productId: createCheckDto.productId,
        type: createCheckDto.type,
        distributorId: createCheckDto.distributorId,
        dilerId: createCheckDto.dilerId,
        summary: summary,
      },
    });

    await this.generatePdfService.generatePDF(check.id);

    return check;
  }
  async createDistCheck(createCheckDto: CreateDistCheckDto) {
    if (createCheckDto.type !== 'RECEPTION') {
      throw new BadRequestException('Чек типа RECEPTION');
    }

    if (createCheckDto.type === 'RECEPTION' && !createCheckDto.makerId) {
      throw new BadRequestException('Укажите Производителя');
    }

    const promises = [
      this.userService.findOne(createCheckDto.distributorId),
      this.userService.findOne(createCheckDto.makerId),
    ];

    const [distributor, maker] = await Promise.all(promises);

    if (distributor.role !== 'DISTRIBUTOR') {
      throw new BadRequestException('User is not a DISTRIBUTOR');
    }
    if (createCheckDto.makerId && maker && maker.role !== 'MAKER') {
      throw new BadRequestException('User is not a MAKER');
    }

    const warehouse = await this.db.warehouse.findFirst({
      where: {
        id: createCheckDto.warehouseId,
        distributorId: createCheckDto.distributorId,
      },
    });
    if (!warehouse) {
      throw new BadRequestException('Склад не найден');
    }

    // Создаем или обновляем продукты и сохраняем их ID
    const supplyProducts = await Promise.all(
      createCheckDto.supplyProducts.map(async (sp) => {
        const originalProduct = await this.db.product.findUnique({
          where: { id: sp.productId },
          include: { characteristics: true },
        });

        if (!originalProduct) {
          throw new BadRequestException('Продукт не найден');
        }

        const existingProduct = await this.db.product.findFirst({
          where: {
            name: originalProduct.name,
            makerId: createCheckDto.makerId,
            ownerId: createCheckDto.distributorId,
            deleted: false,
          },
        });

        if (existingProduct) {
          // Обновляем количество существующего продукта
          await this.db.product.update({
            where: { id: existingProduct.id },
            data: { quantity: { increment: sp.quantity } },
          });

          return {
            productId: existingProduct.id,
            quantity: sp.quantity,
            price: sp.price,
          };
        } else {
          // Создаем копию продукта
          const newProduct = await this.db.product.create({
            data: {
              name: originalProduct.name,
              price: sp.price,
              makerId: createCheckDto.makerId,
              ownerId: createCheckDto.distributorId,
              quantity: sp.quantity,
              deleted: false,
              characteristics: {
                create: originalProduct.characteristics.map((char) => ({
                  name: char.name,
                  value: char.value,
                  rowKey: char.rowKey,
                })),
              },
            },
          });

          return {
            productId: newProduct.id,
            quantity: sp.quantity,
            price: sp.price,
          };
        }
      }),
    );

    // Создаем supply и supplyProducts
    const supply = await this.db.supply.create({
      data: {
        date: createCheckDto.date,
        warehouseId: warehouse.id,
        supplyProducts: {
          create: supplyProducts.map((sp) => ({
            productId: sp.productId,
            quantity: sp.quantity,
            price: sp.price,
          })),
        },
      },
      include: {
        supplyProducts: {
          include: {
            product: true,
          },
        },
      },
    });

    // Создаем чек
    const summary = supply.supplyProducts.reduce(
      (acc, sp) => acc + sp.price * sp.quantity,
      0,
    );

    const check = await this.db.check.create({
      data: {
        productQuantity: createCheckDto.supplyProducts.reduce(
          (acc, sp) => acc + sp.quantity,
          0,
        ),
        type: createCheckDto.type,
        distributorId: createCheckDto.distributorId,
        makerId: createCheckDto.makerId,
        summary: summary,
        supplyId: supply.id,
      },
    });

    await this.generatePdfService.generatePDF(check.id);

    return check;
  }

  async findAll(checkType: string) {
    return await this.db.check.findMany({
      where: { type: CheckType[checkType] },
      include: {
        maker: true,
        diler: true,
        distributor: true,
        supply: {
          include: { supplyProducts: { include: { product: true } } },
        },
      },
    });
  }

  async findOne(id: number) {
    const check = await this.db.check.findFirst({ where: { id } });
    if (!check) {
      throw new NotFoundException('Check not found');
    }
    return check;
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.db.check.delete({ where: { id } });
  }
}
