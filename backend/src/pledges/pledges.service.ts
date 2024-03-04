import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePledgeDto } from './dto/create-pledge.dto';
import { UpdatePledgeDto } from './dto/update-pledge.dto';
import { PrismaService } from 'src/utils/prisma.service';

@Injectable()
export class PledgesService {
  constructor(private db: PrismaService) {}
  async create(body: CreatePledgeDto) {
    const pledge = await this.db.pledges.create({
      data: {
        ...body,
      },
    });

    return pledge;
  }

  async findAll() {
    const pledges = await this.db.pledges.findMany();
    return pledges;
  }

  async findOne(id: number) {
    const pledge = await this.db.pledges.findFirst({
      where: { pledge_code: id },
    });
    return pledge;
  }

  async update(id: number, body: UpdatePledgeDto) {
    const updatedPledge = await this.db.pledges.update({
      where: { pledge_code: id },
      data: body,
    });
    if (!updatedPledge) {
      throw new NotFoundException('Pledge not found');
    }
    return updatedPledge;
  }

  async remove(id: number) {
    const pledge = await this.db.pledges.findUnique({
      where: { pledge_code: id },
      include: { contracts: true },
    });

    if (pledge) {
      if (pledge.contracts.length > 0) {
        throw new ConflictException(
          `Товар ${pledge.description} имеет активные контракты. Его нельзя удалить. (Сначала удалите контракты связанные с этим товаром)`,
        );
      }

      const deletedPledge = await this.db.pledges.delete({
        where: { pledge_code: id },
      });
      return `Товар ${deletedPledge.description} успешно удален, и контракты, связанные с ним, также удалены.`;
    }

    throw new NotFoundException(`Товар ${id} не найден.`);
  }
}
