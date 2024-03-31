import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateClientDto } from './create-client.dto';
import { UpdateClientDto } from './update-client.dto';
import { PrismaService } from 'src/utils/prisma.service';
import { ClientsWithPayoutBetweenDto } from './clientsWithPayoutBetween.dto';

@Injectable()
export class ClientsService {
  constructor(private db: PrismaService) {}
  async create(body: CreateClientDto) {
    const checkExistPassport = await this.db.clients.findFirst({
      where: { passport_data: body?.passport_data },
    });
    if (checkExistPassport) {
      throw new ConflictException('Unique passport required');
    }
    if (body.phone_number == '') {
      body.phone_number = null;
    }
    if (body.address == '') {
      body.address = null;
    }
    const client = await this.db.clients.create({
      data: {
        ...body,
      },
    });

    return client;
  }

  async findAll() {
    const clientsWithSums = await this.db.clients.findMany({
      include: {
        contracts: {
          select: {
            payout_to_client: true,
          },
        },
      },
    });

    const clientsWithTotalPayouts = clientsWithSums.map((client) => {
      const totalPayout = client.contracts.reduce(
        (sum, contract) => sum + (contract.payout_to_client?.toNumber() ?? 0),
        0,
      );
      return { client, totalPayout };
    });

    return clientsWithTotalPayouts;
  }

  async findOne(id: number) {
    const clientWithSum = await this.db.clients.findFirst({
      where: {
        client_code: id, // Используйте переменную `id` непосредственно
      },
      include: {
        contracts: {
          select: {
            payout_to_client: true,
          },
        },
      },
    });

    if (!clientWithSum) {
      throw new NotFoundException('Клиент не найден');
    }

    return clientWithSum;
  }

  async update(id: number, body: UpdateClientDto) {
    if (body.phone_number == '') {
      body.phone_number = null;
    }
    if (body.address == '') {
      body.address = null;
    }
    const updatedUser = await this.db.clients.update({
      where: { client_code: id },
      data: body,
    });
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  async remove(id: number) {
    const client = await this.db.clients.findUnique({
      where: { client_code: id },
      include: { contracts: true },
    });

    if (client) {
      if (client.contracts.length > 0) {
        throw new ConflictException(
          `Клиент ${client.full_name} имеет активные контракты. Его нельзя удалить. (Сначала удалите контракты связанные с этим клиентом)`,
        );
      }

      const deletedClient = await this.db.clients.delete({
        where: { client_code: id },
      });
      return `Клиент ${deletedClient.full_name} успешно удален, и контракты, связанные с ним, также удалены.`;
    }

    throw new NotFoundException(`Клиент ${id} не найден.`);
  }

  // Ласт лаба

  // 2
  async findUniqueClientAddress() {
    return this.db.clients.findMany({
      distinct: ['address'],
    });
  }

  // 3
  async findFirst10Clients() {
    return this.db.clients.findMany({
      take: 10,
    });
  }

  // 4
  async findLast15Clients() {
    return this.db.clients.findMany({
      take: -15,
    });
  }

  // 5
  async averagePayout() {
    return this.db.$queryRaw`SELECT AVG(payout_to_client) FROM contracts`;
  }

  // 5
  async maxPayout() {
    return this.db.$queryRaw`SELECT MAX(payout_to_client) FROM contracts`;
  }

  // 5
  async minPayout() {
    return this.db.$queryRaw`SELECT MIN(payout_to_client) FROM contracts`;
  }

  // 6
  // 6.1
  async findClientById(clientId: number) {
    return this.db.clients.findUnique({
      where: {
        client_code: clientId,
      },
    });
  }

  // 6.3
  async findClientsByNamePattern(pattern: string) {
    return this.db.clients.findMany({
      where: {
        OR: [
          {
            full_name: {
              contains: pattern,
              mode: 'insensitive',
            },
          },
          {
            address: {
              contains: pattern,
              mode: 'insensitive',
            },
          },
          {
            phone_number: {
              contains: pattern,
              mode: 'insensitive',
            },
          },
          {
            passport_data: {
              contains: pattern,
              mode: 'insensitive',
            },
          },
        ],
      },
    });
  }
  // 6.4
  async findClientsWithAddressAndNoPhoneNumber() {
    return this.db.clients.findMany({
      where: {
        AND: [
          {
            address: {
              not: null, // Адрес указан
            },
          },
          {
            phone_number: null, // Паспортные данные не указаны
          },
        ],
      },
    });
  }

  async findClientsWithAddressOrPhoneNumber() {
    return this.db.clients.findMany({
      where: {
        OR: [
          {
            address: {
              not: null, // Адрес указан
            },
          },
          {
            phone_number: {
              not: null, // Паспортные данные указаны
            },
          },
        ],
      },
    });
  }

  async findClientsWithoutAddressOrPhoneNumber() {
    const clients = await this.db.clients.findMany({
      where: {
        NOT: [
          {
            address: null, // Адрес не указан
            phone_number: null, // Паспортные данные не указаны
          },
        ],
      },
    });

    return clients.length > 0 ? [clients[0]] : null;
  }

  async Exists(address: string) {
    const clients = await this.db.clients.findMany({
      where: {
        address,
      },
      include: {
        contracts: {
          select: {
            payout_to_client: true,
          },
        },
      },
    });

    if (!clients) {
      throw new NotFoundException('Клиент не найден');
    }

    return clients.length > 0 ? [clients[0]] : null;
  }
  // 6.5
  async findClientsWithPhoneNumber() {
    return this.db.clients.findMany({
      where: {
        phone_number: {
          not: null, // Имеется номер телефона
        },
      },
    });
  }

  // 7
  async clientsWithPayoutBetween(body: ClientsWithPayoutBetweenDto) {
    return this.db.$queryRaw`
    SELECT c.*, SUM(co.payout_to_client) as total_payout
    FROM clients c
    JOIN contracts co ON c.client_code = co.client_code
    GROUP BY c.client_code
    HAVING SUM(co.payout_to_client) BETWEEN ${body.min} AND ${body.max}`;
  }

  // 8
  async findClientsSorted() {
    return this.db.clients.findMany({
      orderBy: [
        {
          full_name: 'asc',
        },
        {
          client_code: 'desc',
        },
      ],
    });
  }
  // 9
  async countContractsPerClient() {
    return this.db.clients.findMany({
      select: {
        client_code: true,
        full_name: true,
        address: true,
        phone_number: true,
        passport_data: true,
        _count: {
          select: {
            contracts: true,
          },
        },
      },
      orderBy: {
        contracts: {
          _count: 'desc',
        },
      },
    });
  }

  //10
  async findClientsWithNamesStartingAOrB() {
    return this.db.$queryRaw`
      (SELECT * FROM clients WHERE full_name LIKE 'А%')
      EXCEPT
      (SELECT * FROM clients WHERE full_name LIKE 'Б%')
      ORDER BY full_name ASC`;
  }

  //14
  async findEmployeesCelebratingAnniversariesNextMonth() {
    const nextMonthStart = new Date();
    nextMonthStart.setMonth(nextMonthStart.getMonth() + 1, 1); // Начало следующего месяца
    const nextMonthEnd = new Date(
      nextMonthStart.getFullYear(),
      nextMonthStart.getMonth() + 1,
      0,
    ); // Конец следующего месяца

    await this.db.$queryRaw`
SELECT 
  full_name AS "Фамилия И.",
  EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) + 1 AS "Возраст на момент юбилея",
  date_of_birth AS "Дата рождения"
FROM 
  clients
WHERE 
  EXTRACT(MONTH FROM date_of_birth) = ${nextMonthStart.getMonth() + 1}
  AND EXTRACT(DAY FROM date_of_birth) BETWEEN ${nextMonthStart.getDate()} AND ${nextMonthEnd.getDate()}
  AND (EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) + 1) % 10 = 0
ORDER BY 
  date_of_birth ASC
`;
  }
}
