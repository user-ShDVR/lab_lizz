import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/utils/prisma.service';
import { GeneratePdfService } from 'src/utils/generate-pdf.service';
import { CreateContractDto } from './create-contract.dto';
import { UpdateContractDto } from './update-contract.dto';

@Injectable()
export class ContractsService {
  constructor(
    private db: PrismaService,
    private genPDF: GeneratePdfService,
  ) {}

  async findАll(startDate: Date, endDate: Date) {
    const contracts = await this.db.$queryRaw`
      SELECT * FROM contracts
      WHERE creation_date >= ${startDate} AND creation_date <= ${endDate}
    `;
    return contracts;
  }

  async findАllMin(startDate: Date) {
    const contracts = await this.db.$queryRaw`
      SELECT * FROM contracts
      WHERE creation_date <= ${startDate}
    `;
    return contracts;
  }

  async findАllMax(startDate: Date) {
    const contracts = await this.db.$queryRaw`
      SELECT * FROM contracts
      WHERE creation_date >= ${startDate}
    `;
    return contracts;
  }

  async create(body: CreateContractDto) {
    await Promise.all([
      this.checkIfExists(
        'clients',
        'client_code',
        body.client_code,
        'Клиент не найден, контракт не создан',
      ),
      this.checkIfExists(
        'pledges',
        'pledge_code',
        body.pledge_code,
        'Товар не найден, контракт не создан',
      ),
      this.checkIfExists(
        'employees',
        'employee_code',
        body.employee_code,
        'Работодатель не найден, контракт не создан',
      ),
    ]);
    const contract = await this.db.contracts.create({
      data: {
        contract_type: body.contract_type,
        payment_date: new Date(body.payment_date),
        termination_date: new Date(body.termination_date),
        payout_to_client: body.payout_to_client,
        client_code: body.client_code,
        pledge_code: body.pledge_code,
        employee_code: body.employee_code,
      },
      include: {
        clients: true,
        employees: true,
        pledges: true,
      },
    });
    await this.genPDF.generatePDF(contract);

    return contract;
  }

  async findAll(startDate: Date, endDate: Date) {
    console.log(startDate, endDate);
    const contracts = await this.db.contracts.findMany({
      where: {
        creation_date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    return contracts;
  }

  async findOne(id: number) {
    const contract = await this.db.contracts.findFirst({
      where: { contract_code: id },
    });
    return contract;
  }

  async update(id: number, body: UpdateContractDto) {
    const updatedСontract = await this.db.contracts.update({
      where: { contract_code: id },
      data: {
        contract_type: body.contract_type,
        payment_date: new Date(body.payment_date),
        termination_date: new Date(body.termination_date),
        payout_to_client: body.payout_to_client,
        client_code: body.client_code,
        pledge_code: body.pledge_code,
        employee_code: body.employee_code,
      },
      include: {
        clients: true,
        employees: true,
        pledges: true,
      },
    });
    if (!updatedСontract) {
      throw new NotFoundException('Сontract not found');
    }
    await this.genPDF.generatePDF(updatedСontract);
    return updatedСontract;
  }

  async remove(id: number) {
    const contract = await this.db.contracts.findUnique({
      where: { contract_code: id },
    });

    if (contract) {
      const deletedContract = await this.db.contracts.delete({
        where: { contract_code: id },
      });
      return `Контракт №${deletedContract.contract_code} успешно удален`;
    }
    return null;
  }
  async checkIfExists(model: string, field, value, errorMessage) {
    const result = await this.db[model].findFirst({
      where: {
        [field]: value,
      },
    });
    if (!result) {
      throw new NotFoundException(errorMessage);
    }
  }
}
