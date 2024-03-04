// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PrismaService } from 'src/utils/prisma.service';

@Injectable()
export class EmployeesService {
  constructor(private db: PrismaService) {}

  async create(body: CreateEmployeeDto) {
    const checkExistPhoneNumber = await this.db.$queryRaw`
      SELECT * FROM employees
      WHERE phone_number = ${body.phone_number}
    `;

    if (checkExistPhoneNumber.length > 0) {
      throw new ConflictException('Unique phone number required');
    }

    const employer = await this.db.$queryRaw`
      INSERT INTO employees (full_name, address, birth_date, phone_number, position)
      VALUES (${body.full_name}, ${body.address}, ${new Date(
        body.birth_date,
      )}, ${body.phone_number}, ${body.position})
      RETURNING *;
    `;

    return employer[0];
  }

  async findAll() {
    const employees = await this.db.$queryRaw`SELECT * FROM employees;`;
    return employees;
  }

  async findOne(id: number) {
    const employer = await this.db.$queryRaw`
      SELECT * FROM employees
      WHERE employee_code = ${id};
    `;

    return employer[0];
  }

  async update(id: number, body: UpdateEmployeeDto) {
    const updatedEmployer = await this.db.$queryRaw`
      UPDATE employees
      SET full_name = ${body.full_name},
          address = ${body.address},
          birth_date = ${new Date(body.birth_date)},
          phone_number = ${body.phone_number},
          position = ${body.position}
      WHERE employee_code = ${id}
      RETURNING *;
    `;

    if (updatedEmployer.length === 0) {
      throw new NotFoundException('Employer not found');
    }

    return updatedEmployer[0];
  }

  async remove(id: number) {
    const employer = await this.db.$queryRaw`
      SELECT * FROM employees
      WHERE employee_code = ${id}
      LEFT JOIN contracts ON employees.employee_code = contracts.employee_code;
    `;

    if (employer.length > 0) {
      if (employer[0].contracts.length > 0) {
        throw new ConflictException(
          `Работодатель ${employer[0].full_name} имеет активные контракты. Его нельзя удалить. (Сначала удалите контракты, связанные с этим работодателем)`,
        );
      }

      const deletedEmployer = await this.db.$queryRaw`
        DELETE FROM employees
        WHERE employee_code = ${id}
        RETURNING *;
      `;

      return `Работодатель ${deletedEmployer[0].full_name} успешно удален, и контракты, связанные с ним, также удалены.`;
    }

    throw new NotFoundException(`Работодатель ${id} не найден.`);
  }

  async findEmployeesCelebratingEveryFiveYearsAnniversaryNextMonth() {
    const today = new Date();
    const nextMonth = today.getMonth() + 1;
    const nextMonthYear = today.getFullYear() + (nextMonth === 12 ? 1 : 0);
    const formattedDate = `${nextMonthYear}-${String(
      (nextMonth % 12) + 1,
    ).padStart(2, '0')}-01`;

    const query = `
      SELECT 
        employee_code,
        full_name,
        birth_date,
        position,
        EXTRACT(YEAR FROM age(timestamp '${formattedDate}', birth_date)) + 1 AS age_next_month,
        EXTRACT(MONTH FROM birth_date) AS birth_month,
        EXTRACT(DAY FROM birth_date) AS birth_day,
        (EXTRACT(YEAR FROM birth_date) + (EXTRACT(YEAR FROM age(timestamp '${formattedDate}', birth_date)) + 1) / 5 * 5) AS next_anniversary_year
      FROM 
        employees
      WHERE
        EXTRACT(MONTH FROM birth_date) = ${(nextMonth % 12) + 1} AND
        (EXTRACT(YEAR FROM age(timestamp '${formattedDate}', birth_date)) + 1) % 5 = 0
    `;

    const employeesCelebratingAnniversary =
      await this.db.$queryRawUnsafe(query);

    const employeesWithNextAnniversaryDate =
      employeesCelebratingAnniversary.map((employee) => {
        const nextAnniversaryDateString = `${
          employee.next_anniversary_year
        }-${String(employee.birth_month).padStart(2, '0')}-${String(
          employee.birth_day,
        ).padStart(2, '0')}`;

        return {
          ...employee,
          next_anniversary_date: `${nextAnniversaryDateString}T00:00:00.000Z`,
        };
      });

    return employeesWithNextAnniversaryDate;
  }
}
