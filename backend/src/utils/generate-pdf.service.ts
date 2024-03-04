import { Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import * as fs from 'fs';
import * as path from 'path';
import * as PDFDocument from 'pdfkit';
interface IContractData {
  contract_code: number;
  contract_type: string;
  payment_date: Date;
  creation_date: Date;
  termination_date: Date;
  payout_to_client: Decimal;
  client_code: number;
  pledge_code: number;
  employee_code: number;
  clients: {
    full_name: string;
    phone_number: string;
    passport_data: string;
  };
  employees: {
    full_name: string;
    phone_number: string;
  };
  pledges: {
    description: string;
    characteristics: string;
    price: Decimal;
  };
}
@Injectable()
export class GeneratePdfService {
  async generatePDF(contractData: IContractData): Promise<string> {
    const doc = new PDFDocument();
    const filename = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      `${contractData.contract_code}.pdf`,
    );
    const stream = fs.createWriteStream(filename);

    doc.pipe(stream);
    const fontPath = path.join(__dirname, '..', '..', 'fonts', 'arial.ttf');
    doc.font(fontPath);

    doc
      .fontSize(14)
      .text('Данные контракта:', { align: 'center', lineGap: 20 });

    doc.fontSize(12).text(`Код контракта: ${contractData.contract_code}`);
    doc
      .fontSize(12)
      .text(`Предмет контракта: ${contractData.pledges.description}`);
    doc
      .fontSize(12)
      .text(`Характеристика предмета: ${contractData.pledges.characteristics}`);
    doc.fontSize(12).text(`Цена предмета: ${contractData.pledges.price}₽`, {
      lineGap: 20,
    });

    doc.fontSize(12).text('Данные клиента:', { align: 'left' });
    doc.fontSize(12).text(`ФИО: ${contractData.clients.full_name}`);
    doc.fontSize(12).text(`Паспорт: ${contractData.clients.passport_data}`);
    doc
      .fontSize(12)
      .text(`Номер телефона: ${contractData.clients.phone_number}`, {
        lineGap: 20,
      });

    doc.fontSize(12).text('Данные сотрудника:', { align: 'left' });
    doc.fontSize(12).text(`ФИО: ${contractData.employees.full_name}`);
    doc
      .fontSize(12)
      .text(`Номер телефона: ${contractData.employees.phone_number}`, {
        lineGap: 20,
      });

    doc.fontSize(12).text('Даты контракта:', { align: 'left' });
    doc.fontSize(12).text(`Дата создания: 
    ${contractData.creation_date}`);
    doc.fontSize(12).text(`Дата расторжения: 
    ${contractData.termination_date}`);
    doc.fontSize(12).text(`Дата оплаты: 
    ${contractData.payment_date}`);

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(filename));
      stream.on('error', reject);
    });
  }
}
