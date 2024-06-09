import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as PDFDocument from 'pdfkit';
import { PrismaService } from './prisma.service'; // Подключаем сервис Prisma

@Injectable()
export class GeneratePdfService {
  constructor(private readonly prisma: PrismaService) {}

  async generatePDF(checkId: number): Promise<string> {
    const check = await this.prisma.check.findUnique({
      where: { id: checkId },
      include: {
        supply: {
          include: {
            supplyProducts: {
              include: {
                product: true,
              },
            },
            warehouse: {
              include: {
                distributor: true,
              },
            },
          },
        },
        product: true,
        distributor: true,
        maker: true,
        diler: true,
      },
    });

    if (!check) {
      throw new Error('Чек не найден');
    }
    console.log(check.maker);
    let type;
    switch (check.type) {
      case 'SALE':
        type = 'договор на продажу товаров';
        break;
      case 'RECEPTION':
        type = 'договор на приём товаров';
        break;
    }

    const doc = new PDFDocument({ margin: 30 });
    const filename = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      `${checkId}.pdf`,
    );
    const stream = fs.createWriteStream(filename);

    doc.pipe(stream);
    const fontPath = path.join(__dirname, '..', '..', 'fonts', 'arial.ttf');
    const boldFontPath = path.join(
      __dirname,
      '..',
      '..',
      'fonts',
      'arial-bold.ttf',
    );

    doc.font(fontPath);

    // Заголовок документа
    doc
      .font(boldFontPath)
      .fontSize(16)
      .text('Данные договора:', { align: 'center', lineGap: 10 });
    doc.moveDown();

    // Основная информация о договоре
    doc
      .font(fontPath)
      .fontSize(12)
      .text(`Дата заключения договора: ${check.date.toLocaleDateString()}`, {
        lineGap: 10,
      });
    doc.font(fontPath).fontSize(12).text(`Тип договора: ${type}`);
    doc.moveDown();

    // Продукты
    doc
      .font(boldFontPath)
      .fontSize(16)
      .text('Продукты:', { align: 'center', lineGap: 20 });
    doc.moveDown();
    if (check.product) {
      doc.font(fontPath).fontSize(12).text(`Название: ${check.product.name}`);
      doc
        .font(fontPath)
        .fontSize(12)
        .text(`Количество: ${check.productQuantity}`);
      doc
        .font(fontPath)
        .fontSize(12)
        .text(`Цена за единицу: ${check.product.price} руб.`);
      doc
        .font(fontPath)
        .fontSize(12)
        .text(`Сумма: ${check.product.price * check.productQuantity} руб.`);
      doc.moveDown();
    }
    if (check.supply && check.supply.supplyProducts)
      check.supply.supplyProducts.forEach((sp, index) => {
        doc
          .font(boldFontPath)
          .fontSize(12)
          .text(`Продукт ${index + 1}:`, { lineGap: 10 });
        doc.font(fontPath).fontSize(12).text(`Название: ${sp.product.name}`);
        doc.font(fontPath).fontSize(12).text(`Количество: ${sp.quantity}`);
        doc
          .font(fontPath)
          .fontSize(12)
          .text(`Цена за единицу: ${sp.price} руб.`);
        doc
          .font(fontPath)
          .fontSize(12)
          .text(`Сумма: ${sp.price * sp.quantity} руб.`);
        doc.moveDown();
      });

    doc
      .moveTo(doc.x, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .stroke();
    doc
      .font(boldFontPath)
      .fontSize(16)
      .text('Информация о дистрибьюторе:', { align: 'center', lineGap: 20 });
    doc
      .font(fontPath)
      .fontSize(12)
      .text(`Наименование: ${check.distributor.companyName}`);
    doc
      .font(fontPath)
      .fontSize(12)
      .text(`Юридический адрес: ${check.distributor.legalAddress}`);
    doc
      .font(fontPath)
      .fontSize(12)
      .text(`Контактный номер: ${check.distributor.contactNumber}`);
    doc.moveDown();

    if (check.maker !== null) {
      doc
        .moveTo(doc.x, doc.y)
        .lineTo(doc.page.width - doc.page.margins.right, doc.y)
        .stroke();
      doc
        .font(boldFontPath)
        .fontSize(16)
        .text('Информация о производителе:', { align: 'center', lineGap: 20 });
      doc
        .font(fontPath)
        .fontSize(12)
        .text(`Наименование: ${check.maker.companyName}`);
      doc
        .font(fontPath)
        .fontSize(12)
        .text(`Юридический адрес: ${check.maker.legalAddress}`);
      doc
        .font(fontPath)
        .fontSize(12)
        .text(`Контактный номер: ${check.maker.contactNumber}`);
      doc.moveDown();

      doc
        .moveTo(doc.x, doc.y)
        .lineTo(doc.page.width - doc.page.margins.right, doc.y)
        .stroke();
      doc
        .font(boldFontPath)
        .fontSize(16)
        .text('Информация о поставке:', { align: 'center', lineGap: 20 });
      doc
        .font(fontPath)
        .fontSize(12)
        .text(`Дата поставки: ${check.date.toLocaleDateString()}`);
      doc
        .font(fontPath)
        .fontSize(12)
        .text(`Склад: ${check.supply.warehouse.name}`);
      doc
        .font(fontPath)
        .fontSize(12)
        .text(`Адрес склада: ${check.supply.warehouse.address}`);
      doc.moveDown();
    }

    if (check.diler !== null) {
      doc
        .moveTo(doc.x, doc.y)
        .lineTo(doc.page.width - doc.page.margins.right, doc.y)
        .stroke();
      doc
        .font(boldFontPath)
        .fontSize(16)
        .text('Информация о диллере:', { align: 'center', lineGap: 20 });
      doc
        .font(fontPath)
        .fontSize(12)
        .text(`Наименование: ${check.diler.companyName}`);
      doc
        .font(fontPath)
        .fontSize(12)
        .text(`Юридический адрес: ${check.diler.legalAddress}`);
      doc
        .font(fontPath)
        .fontSize(12)
        .text(`Контактный номер: ${check.diler.contactNumber}`);
    }

    doc
      .moveTo(doc.x, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .stroke();
    doc
      .font(boldFontPath)
      .fontSize(16)
      .text('Общая сумма:', { align: 'center', lineGap: 20 });
    doc.font(fontPath).fontSize(12).text(`${check.summary} руб.`);

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(filename));
      stream.on('error', reject);
    });
  }
}
