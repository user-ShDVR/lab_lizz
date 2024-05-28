import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/utils/prisma.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ProductService {
  constructor(
    private db: PrismaService,
    private userService: UserService,
  ) {}
  async create(createProductDto: CreateProductDto) {
    const user = await this.userService.findOne(createProductDto.makerId);
    if (user.role != 'MAKER') {
      throw new BadRequestException(
        'Этот пользователь не может создавать продукты',
      );
    }
    const { characteristics, ...productData } = createProductDto;
    const product = await this.db.product.create({
      data: {
        name: productData.name,
        price: productData.price,
        makerId: productData.makerId,
        ownerId: productData.makerId,
        quantity: productData.quantity,
        characteristics: {
          create: characteristics?.map((char) => ({
            name: char.name,
            value: char.value,
            rowKey: char.rowKey,
          })),
        },
      },
    });
    return product;
  }

  async findAll() {
    return await this.db.product.findMany();
  }

  async findOne(id: number) {
    const product = await this.db.product.findFirst({ where: { id } });
    if (!product) {
      throw new NotFoundException('Продукт не найден');
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);
    if (
      updateProductDto.makerId &&
      updateProductDto.makerId != product.makerId
    ) {
      const user = await this.userService.findOne(updateProductDto.makerId);
      if (user.role != 'MAKER') {
        throw new BadRequestException(
          'Этот пользователь не может менять продукты',
        );
      }
    }

    const { characteristics, ...productData } = updateProductDto;
    return await this.db.product.update({
      where: { id },
      data: {
        name: productData.name,
        price: productData.price,
        makerId: productData.makerId,
        characteristics: {
          upsert: characteristics?.map((char) => ({
            where: { id: char.id || 0 },
            update: { name: char.name, value: char.value, rowKey: char.rowKey },
            create: { name: char.name, value: char.value, rowKey: char.rowKey },
          })),
        },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.db.product.delete({ where: { id } });
  }
}
