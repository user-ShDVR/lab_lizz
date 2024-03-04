import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEmployeeDto } from './create-employee.dto';
import { UpdateEmployeeDto } from './update-employee.dto';
import { PrismaService } from 'src/utils/prisma.service';

@Injectable()
export class EmployeesService {
  constructor(private db: PrismaService) {}
  async create(body: CreateEmployeeDto) {
    const checkExistPhoneNumber = await this.db.employees.findFirst({
      where: { phone_number: body?.phone_number },
    });
    if (checkExistPhoneNumber) {
      throw new ConflictException('Unique phone number required');
    }

    const employer = await this.db.employees.create({
      data: {
        full_name: body.full_name,
        address: body.address,
        birth_date: new Date(body.birth_date),
        phone_number: body.phone_number,
        position: body.position,
      },
    });

    return employer;
  }

  async findAll() {
    const employees = await this.db.employees.findMany();
    return employees;
  }

  async findOne(id: number) {
    const employer = await this.db.employees.findFirst({
      where: { employee_code: id },
    });
    return employer;
  }

  async update(id: number, body: UpdateEmployeeDto) {
    const updatedEmployer = await this.db.employees.update({
      where: { employee_code: id },
      data: {
        full_name: body.full_name,
        address: body.address,
        birth_date: new Date(body.birth_date),
        phone_number: body.phone_number,
        position: body.position,
      },
    });
    if (!updatedEmployer) {
      throw new NotFoundException('Employer not found');
    }
    return updatedEmployer;
  }

  async remove(id: number) {
    const employer = await this.db.employees.findUnique({
      where: { employee_code: id },
      include: { contracts: true },
    });

    if (employer) {
      if (employer.contracts.length > 0) {
        throw new ConflictException(
          `Работодатель ${employer.full_name} имеет активные контракты. Его нельзя удалить. (Сначала удалите контракты связанные с этим работодателем)`,
        );
      }

      const deletedEmployer = await this.db.employees.delete({
        where: { employee_code: id },
      });
      return `Работодатель ${deletedEmployer.full_name} успешно удален, и контракты, связанные с ним, также удалены.`;
    }

    throw new NotFoundException(`Работодатель ${id} не найден.`);
  }
  //14
  async findEmployeesCelebratingEveryFiveYearsAnniversaryNextMonth() {
    const today = new Date();
    const nextMonth = today.getMonth() + 1;
    const nextMonthYear = today.getFullYear() + (nextMonth === 12 ? 1 : 0);
    const formattedDate = `${nextMonthYear}-${String(
      (nextMonth % 12) + 1,
    ).padStart(2, '0')}-01`;
    console.log(formattedDate);
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

    const employeesCelebratingAnniversary = (await this.db.$queryRawUnsafe(
      query,
    )) as any[];

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
