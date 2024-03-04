// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/utils/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientsWithPayoutBetweenDto } from './dto/clientsWithPayoutBetween.dto';

@Injectable()
export class ClientsService {
  constructor(private db: PrismaService) {}
  async create(body: CreateClientDto) {
    const checkExistPassport = await this.db
      .$queryRaw`SELECT * FROM clients WHERE passport_data = ${body.passport_data} LIMIT 1`;

    if (checkExistPassport) {
      throw new ConflictException('Unique passport required');
    }
    const phoneNumber = body.phone_number === '' ? null : body.phone_number;
    const address = body.address === '' ? null : body.address;

    const client = await this.db.$queryRaw`
        INSERT INTO clients (full_name, passport_data, phone_number, address)
        VALUES (${body.full_name}, ${body.passport_data}, ${phoneNumber}, ${address})
        RETURNING *`;

    return client;
  }

  async findAll() {
    const clientsWithTotalPayouts = await this.db.$queryRaw`
        SELECT c.*, COALESCE(SUM(co.payout_to_client), 0) AS total_payout
        FROM clients c
        LEFT JOIN contracts co ON c.client_code = co.client_code
        GROUP BY c.client_code`;

    return clientsWithTotalPayouts;
  }

  async findOne(id: number) {
    const clientWithSum = await this.db.$queryRaw`
        SELECT c.*, COALESCE(SUM(co.payout_to_client), 0) AS total_payout
        FROM clients c
        LEFT JOIN contracts co ON c.client_code = co.client_code
        WHERE c.client_code = ${id}
        GROUP BY c.client_code
        LIMIT 1`;

    if (!clientWithSum) {
      throw new NotFoundException('Клиент не найден');
    }

    return clientWithSum;
  }

  async update(id: number, body: UpdateClientDto) {
    const updatedUser = await this.db.$queryRaw`
        UPDATE clients
        SET phone_number = ${body.phone_number}, address = ${body.address}, passport_data = ${body.passport_data}, full_name = ${body.full_name}
        WHERE client_code = ${id}
        RETURNING *`;

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  async remove(id: number) {
    const contracts = await this.db
      .$queryRaw`SELECT * FROM contracts WHERE client_code = ${id}`;

    if (contracts) {
      if (contracts.length > 0) {
        throw new ConflictException(
          `Клиент ${contracts.client.full_name} имеет активные контракты. Его нельзя удалить. (Сначала удалите контракты связанные с этим клиентом)`,
        );
      }

      const deletedClient = await this.db
        .$queryRaw`DELETE FROM clients WHERE client_code = ${id} RETURNING *`;
      return `Клиент ${deletedClient.full_name} успешно удален, и контракты, связанные с ним, также удалены.`;
    }

    throw new NotFoundException(`Клиент ${id} не найден.`);
  }

  // 2
  async findUniqueClientAddress() {
    return await this.db.$queryRaw`SELECT DISTINCT address FROM clients`;
  }

  // 3
  async findFirst10Clients() {
    return await this.db
      .$queryRaw`SELECT * FROM clients ORDER BY client_code ASC LIMIT 10`;
  }

  // 4
  async findLast15Clients() {
    return await this.db
      .$queryRaw`SELECT * FROM clients ORDER BY client_code DESC LIMIT 15`;
  }

  // 5
  async averagePayout() {
    return await this.db.$queryRaw`SELECT AVG(payout_to_client) FROM contracts`;
  }

  // 5
  async maxPayout() {
    return await this.db.$queryRaw`SELECT MAX(payout_to_client) FROM contracts`;
  }

  // 5
  async minPayout() {
    return await this.db.$queryRaw`SELECT MIN(payout_to_client) FROM contracts`;
  }

  // 6
  // 6.1
  async findClientById() {
    return await this.db.$queryRaw`
    SELECT c.*, COALESCE(SUM(co.payout_to_client), 0) AS total_payout
    FROM clients c
    LEFT JOIN contracts co ON c.client_code = co.client_code
    WHERE c.client_code = ${id}
    GROUP BY c.client_code
    LIMIT 1`;
  }

  // 6.3
  async findClientsByNamePattern(pattern: string) {
    return await this.db.$queryRaw`
    SELECT * FROM clients
    WHERE full_name ILIKE ${'%' + pattern + '%'}
       OR address ILIKE ${'%' + pattern + '%'}
       OR phone_number ILIKE ${'%' + pattern + '%'}
    `;
  }
  // 6.4
  async findClientsByAddressAndPassportCriteria() {
    return await this.db.$queryRaw`
    SELECT * FROM clients
    WHERE (address IS NOT NULL AND phone_number IS NULL)
       OR (address IS NULL AND phone_number IS NOT NULL)
    `;
  }
  // 6.5
  async findClientsWithPhoneNumber() {
    return await this.db
      .$queryRaw`SELECT * FROM clients WHERE phone_number IS NOT NULL`;
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
    return this.db
      .$queryRaw`SELECT * FROM clients ORDER BY full_name ASC, client_code DESC`;
  }
  // 9
  async countContractsPerClient() {
    return this.db.$queryRaw`
    SELECT c.client_code, c.full_name, c.address, c.phone_number, c.passport_data, COUNT(co.client_code) AS contracts_count
    FROM clients c
    LEFT JOIN contracts co ON c.client_code = co.client_code
    GROUP BY c.client_code
    ORDER BY contracts_count DESC
  `;
  }

  //10
  async findClientsWithNamesStartingAOrB() {
    return this.db.$queryRaw`
        (SELECT * FROM clients WHERE full_name LIKE 'А%')
        EXCEPT
        (SELECT * FROM clients WHERE full_name LIKE 'Б%')
        ORDER BY full_name ASC`;
  }
}
