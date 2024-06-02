import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/utils/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private db: PrismaService) {}
  async create(createUserDto: CreateUserDto) {
    if (
      createUserDto.role !== 'DISTRIBUTOR' &&
      createUserDto.role !== 'MAKER' &&
      createUserDto.role !== 'DILER'
    ) {
      throw new BadRequestException('Role must be DISTRIBUTOR or MAKER');
    }
    if (createUserDto.role === 'MAKER' && !createUserDto.country) {
      throw new BadRequestException('Country is required for MAKER role');
    }

    const promises = [
      this.db.user.findFirst({ where: { INN: createUserDto.INN } }),
      this.db.user.findFirst({ where: { BIK: createUserDto.BIK } }),
      this.db.user.findFirst({ where: { KPP: createUserDto.KPP } }),
      this.db.user.findFirst({
        where: { paymentAccount: createUserDto.paymentAccount },
      }),
      this.db.user.findFirst({
        where: { contactNumber: createUserDto.contactNumber },
      }),
    ];

    const [inn, bik, kpp, paymentAccount, contactNumber] =
      await Promise.all(promises);

    if (inn) {
      throw new BadRequestException('ИНН уже существует');
    }
    if (bik) {
      throw new BadRequestException('БИК уже существует');
    }
    if (kpp) {
      throw new BadRequestException('КПП уже существует');
    }
    if (paymentAccount) {
      throw new BadRequestException('Р/С уже существует');
    }
    if (contactNumber) {
      throw new BadRequestException('Контактный телефон уже существует');
    }
    const user = await this.db.user.create({
      data: {
        role: createUserDto.role,
        companyName: createUserDto.companyName,
        contactNumber: createUserDto.contactNumber,
        INN: createUserDto.INN,
        BIK: createUserDto.BIK,
        KPP: createUserDto.KPP,
        paymentAccount: createUserDto.paymentAccount,
        legalAddress: createUserDto.legalAddress,
        country: createUserDto.role === 'MAKER' ? createUserDto.country : null,
        profit: createUserDto.role === 'DISTRIBUTOR' ? 0 : null,
      },
    });
    if (createUserDto.role === 'MAKER') {
      await this.db.maker.create({
        data: {
          id: user.id,
          companyName: user.companyName,
          country: user.country,
          contactNumber: user.contactNumber,
          INN: user.INN,
          BIK: user.BIK,
          KPP: user.KPP,
          paymentAccount: user.paymentAccount,
          legalAddress: user.legalAddress,
        },
      });
    } else if (createUserDto.role === 'DILER') {
      await this.db.diler.create({
        data: {
          id: user.id,
          companyName: user.companyName,
          contactNumber: user.contactNumber,
          INN: user.INN,
          BIK: user.BIK,
          KPP: user.KPP,
          paymentAccount: user.paymentAccount,
          legalAddress: user.legalAddress,
        },
      });
    } else if (createUserDto.role === 'DISTRIBUTOR') {
      await this.db.distributor.create({
        data: {
          id: user.id,
          companyName: user.companyName,
          contactNumber: user.contactNumber,
          INN: user.INN,
          BIK: user.BIK,
          KPP: user.KPP,
          paymentAccount: user.paymentAccount,
          legalAddress: user.legalAddress,
          profit: 0,
        },
      });
    }

    return user;
  }

  async findAll() {
    return await this.db.user.findMany();
  }

  async findAllByRole(role: string) {
    return await this.db.user.findMany({
      where: { role: Role[role] },
      select: {
        id: true,
        companyName: true,
        role: true,
        INN: true,
        BIK: true,
        KPP: true,
        paymentAccount: true,
        legalAddress: true,
        country: true,
        contactNumber: true,
        profit: true,
        products: {
          where: { deleted: false },
          select: {
            id: true,
            name: true,
            price: true,
            quantity: true,
            characteristics: true,
          },
        },
        makerProducts: {
          select: {
            id: true,
            name: true,
            price: true,
            quantity: true,
            characteristics: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const user = await this.db.user.findFirst({ where: { id } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (
      updateUserDto.role === 'MAKER' &&
      !updateUserDto.country &&
      user.country
    ) {
      throw new BadRequestException(
        'Страна для производителя должна быть определена',
      );
    }

    const promises = [
      updateUserDto.INN &&
        updateUserDto.INN != user.INN &&
        this.db.user.findFirst({ where: { INN: updateUserDto.INN } }),
      updateUserDto.BIK &&
        updateUserDto.BIK != user.BIK &&
        this.db.user.findFirst({ where: { BIK: updateUserDto.BIK } }),
      updateUserDto.KPP &&
        updateUserDto.KPP != user.KPP &&
        this.db.user.findFirst({ where: { KPP: updateUserDto.KPP } }),
      updateUserDto.paymentAccount &&
        updateUserDto.paymentAccount != user.paymentAccount &&
        this.db.user.findFirst({
          where: { paymentAccount: updateUserDto.paymentAccount },
        }),
      updateUserDto.contactNumber &&
        updateUserDto.contactNumber != user.contactNumber &&
        this.db.user.findFirst({
          where: { contactNumber: updateUserDto.contactNumber },
        }),
    ];
    const [inn, bik, kpp, paymentAccount, contactNumber] =
      await Promise.all(promises);
    if (inn) {
      throw new BadRequestException('ИНН уже существует');
    }
    if (bik) {
      throw new BadRequestException('БИК уже существует');
    }
    if (kpp) {
      throw new BadRequestException('КПП уже существует');
    }
    if (paymentAccount) {
      throw new BadRequestException('Р/С уже существует');
    }
    if (contactNumber) {
      throw new BadRequestException('Контактный телефон уже существует');
    }
    const updUser = await this.db.user.update({
      where: { id },
      data: {
        ...updateUserDto,
      },
    });
    if (updUser.role === 'MAKER') {
      await this.db.maker.updateMany({
        where: { id: updUser.id },
        data: {
          id: updUser.id,
          companyName: updUser.companyName,
          country: updUser.country,
          contactNumber: updUser.contactNumber,
          INN: updUser.INN,
          BIK: updUser.BIK,
          KPP: updUser.KPP,
          paymentAccount: updUser.paymentAccount,
          legalAddress: updUser.legalAddress,
        },
      });
    } else if (updUser.role === 'DILER') {
      await this.db.diler.updateMany({
        where: { id: updUser.id },
        data: {
          id: updUser.id,
          companyName: updUser.companyName,
          contactNumber: updUser.contactNumber,
          INN: updUser.INN,
          BIK: updUser.BIK,
          KPP: updUser.KPP,
          paymentAccount: updUser.paymentAccount,
          legalAddress: updUser.legalAddress,
        },
      });
    } else if (updUser.role === 'DISTRIBUTOR') {
      await this.db.distributor.updateMany({
        where: { id: updUser.id },
        data: {
          id: updUser.id,
          companyName: updUser.companyName,
          contactNumber: updUser.contactNumber,
          INN: updUser.INN,
          BIK: updUser.BIK,
          KPP: updUser.KPP,
          paymentAccount: updUser.paymentAccount,
          legalAddress: updUser.legalAddress,
          profit: updUser.profit,
        },
      });
    }
    return updUser;
  }

  async remove(id: number) {
    const user =await this.findOne(id);
    await this.db.user.delete({ where: { id } });
    if (user.role === 'MAKER') {
      await this.db.maker.deleteMany({ where: { id } });
    } else if (user.role === 'DILER') {
      await this.db.diler.deleteMany({ where: { id } });
    } else if (user.role === 'DISTRIBUTOR') {
      await this.db.distributor.deleteMany({ where: { id } });
    }
    return user;
  }
}
