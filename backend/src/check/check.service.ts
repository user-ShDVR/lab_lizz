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

@Injectable()
export class CheckService {
  constructor(
    private db: PrismaService,
    private productService: ProductService,
    private userService: UserService,
    private generatePdfService: GeneratePdfService,
  ) {}
  async create(createCheckDto: CreateCheckDto) {
    if (createCheckDto.type !== 'SALE' && createCheckDto.type !== 'RECEPTION') {
      throw new BadRequestException('Check type must be SALE or RECEPTION');
    }
    if (createCheckDto.type === 'SALE' && !createCheckDto.dilerId) {
      throw new BadRequestException('Diler is required');
    }

    if (createCheckDto.type === 'RECEPTION' && !createCheckDto.makerId) {
      throw new BadRequestException('Maker is required');
    }
    const promises = [
      this.userService.findOne(createCheckDto.distributorId),
      this.userService.findOne(createCheckDto.dilerId),
      createCheckDto.makerId
        ? this.userService.findOne(createCheckDto.makerId)
        : Promise.resolve(null),
      this.productService.findOne(createCheckDto.productId),
    ];

    const [distributor, diler, maker] = await Promise.all(promises);

    if (distributor.role !== 'DISTRIBUTOR') {
      throw new BadRequestException('User is not a DISTRIBUTOR');
    }
    if (createCheckDto.dilerId && diler && diler.role !== 'DILER') {
      throw new BadRequestException('User is not a DILER');
    }
    if (createCheckDto.makerId && maker && maker.role !== 'MAKER') {
      throw new BadRequestException('User is not a MAKER');
    }

    const check = await this.db.check.create({ data: createCheckDto });

    await this.generatePdfService.generatePDF(check.id);

    return check;
  }

  async findAll() {
    return await this.db.check.findMany();
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
