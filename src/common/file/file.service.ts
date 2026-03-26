import { Injectable, BadRequestException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class FileService {
  async readExcel(file: Express.Multer.File): Promise<any[]> {
    if (!file || !file.buffer) {
      throw new BadRequestException('File buffer is empty or invalid.');
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer as any);
    
    const worksheet = workbook.worksheets[0];
    const data: any[] = [];
    
    worksheet.eachRow((row, rowNumber) => {
      // 첫 번째 줄은 헤더로 간주
      if (rowNumber > 1) {
        const rowData: Record<string, any> = {};
        row.eachCell((cell, colNumber) => {
          const headerCell = worksheet.getRow(1).getCell(colNumber);
          const headerValue = headerCell.value ? headerCell.value.toString() : `Column${colNumber}`;
          rowData[headerValue] = cell.value;
        });
        data.push(rowData);
      }
    });
    
    return data;
  }
}
