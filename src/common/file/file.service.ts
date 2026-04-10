import { Injectable, BadRequestException } from "@nestjs/common";
import * as ExcelJS from "exceljs";

@Injectable()
export class FileService {
  async readExcel(file: Express.Multer.File): Promise<any[]> {
    if (!file || !file.buffer) {
      throw new BadRequestException("File buffer is empty or invalid.");
    }

    console.log("File info:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      bufferLength: file.buffer?.length,
      firstBytes: file.buffer?.slice(0, 4).toString("hex"),
    });

    // xlsx 파일은 ZIP 형식이므로 PK (50 4b)로 시작해야 함
    const firstBytes = file.buffer.slice(0, 4).toString("hex");
    if (!firstBytes.startsWith("504b")) {
      throw new BadRequestException(
        "유효한 xlsx 파일이 아닙니다. xlsx 파일을 업로드해주세요.",
      );
    }

    const workbook = new ExcelJS.Workbook();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await workbook.xlsx.load(file.buffer as any);

    const worksheet = workbook.worksheets[0];
    const data: any[] = [];

    const headers = [];

    worksheet.eachRow((row, rowNumber) => {
      // 첫 번째 줄은 헤더로 간주
      if (rowNumber > 1) {
        const rowData: Record<string, any> = {};
        row.eachCell((cell, colNumber) => {
          const headerCell = worksheet.getRow(1).getCell(colNumber);
          const headerValue = headerCell.value
            ? headerCell.value.toString()
            : `Column${colNumber}`;
          rowData[headerValue] = cell.value;
        });
        data.push(rowData);
      } else {
        row.eachCell((cell, colNumber) => {
          const headerCell = worksheet.getRow(1).getCell(colNumber);
          const headerValue = headerCell.value
            ? headerCell.value.toString()
            : `Column${colNumber}`;
          headers.push(headerValue);
        });
      }
    });

    return data;
  }
}
