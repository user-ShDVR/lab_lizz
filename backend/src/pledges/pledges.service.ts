// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePledgeDto } from './dto/create-pledge.dto';
import { UpdatePledgeDto } from './dto/update-pledge.dto';
import { PrismaService } from 'src/utils/prisma.service';

@Injectable()
export class PledgesService {
  constructor(private db: PrismaService) {}

  async create(body: CreatePledgeDto) {
    const { description, ...rest } = body;
    const pledge = await this.db.$queryRaw`
      INSERT INTO pledges (description, ${Object.keys(rest).join(', ')})
      VALUES (${description}, ${Object.values(rest).join(', ')})
      RETURNING *;
    `;
    return pledge;
  }

  async findAll() {
    const pledges = await this.db.$queryRaw`SELECT * FROM pledges;`;
    return pledges;
  }

  async findOne(id: number) {
    const pledge = await this.db.$queryRaw`
      SELECT * FROM pledges WHERE pledge_code = ${id};
    `;
    return pledge[0];
  }

  async update(id: number, body: UpdatePledgeDto) {
    const { description, ...rest } = body;

    const updatedPledge = await this.db.$queryRaw`
      UPDATE pledges
      SET description = ${description}, ${Object.entries(rest)
        .map(([key, value]) => `${key} = ${value}`)
        .join(', ')}
      WHERE pledge_code = ${id}
      RETURNING *;
    `;

    return updatedPledge[0];
  }

  async remove(id: number) {
    const pledge = await this.db.$queryRaw`
      SELECT * FROM pledges WHERE pledge_code = ${id}
    `;

    if (pledge.length > 0) {
      await this.db.$queryRaw`
        SELECT COUNT(*) AS count FROM contracts WHERE pledge_code = ${id}
      `;

      await this.db.$queryRaw`DELETE FROM pledges WHERE pledge_code = ${id};`;
    }

    throw new NotFoundException(`Договор ${id} не найден.`);
  }
}
