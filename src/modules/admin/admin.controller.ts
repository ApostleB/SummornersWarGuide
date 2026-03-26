import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { FileService } from '../../common/file/file.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/admin")
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly fileService: FileService
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const data = await this.fileService.readExcel(file);
    return { success: true, data };
  }

  @Post('file/defence')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDefenceFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const data = await this.fileService.readExcel(file);
    return { success: true, data };
  }
}

