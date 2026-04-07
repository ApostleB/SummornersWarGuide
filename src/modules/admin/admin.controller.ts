import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Get,
  Delete,
  Param,
  Put,
  Body,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { AdminService } from "./admin.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { MinLevel } from "../auth/decorators/min-level.decorator";
import { FileService } from "../../common/file/file.service";

const multerOptions = {
  storage: memoryStorage(),
};

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/admin")
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly fileService: FileService,
  ) {}

  @MinLevel("99")
  @Post("upload")
  @UseInterceptors(FileInterceptor("file", multerOptions))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("File is required");
    }
    const data = await this.fileService.readExcel(file);
    return { success: true, data };
  }

  // ========== 코드 관리 (level 99) ==========

  @MinLevel("99")
  @Get("codes/grp")
  async getGrpCdList() {
    const grpCdList = await this.adminService.getGrpCdList();
    return { success: true, grpCdList };
  }

  @MinLevel("99")
  @Get("codes/dtl/:grpCd")
  async getDtlCdList(@Param("grpCd") grpCd: string) {
    const dtlCdList = await this.adminService.getDtlCdList(grpCd);
    return { success: true, dtlCdList };
  }

  @MinLevel("99")
  @Post("codes/dtl")
  async createDtlCd(@Body() data: any) {
    const dtlCd = await this.adminService.createDtlCd(data);
    return { success: true, dtlCd };
  }

  @MinLevel("99")
  @Put("codes/dtl/:idx")
  async updateDtlCd(@Param("idx") idx: number, @Body() data: any) {
    await this.adminService.updateDtlCd(idx, data);
    return { success: true };
  }

  @MinLevel("99")
  @Delete("codes/dtl/:idx")
  async deleteDtlCd(@Param("idx") idx: number) {
    await this.adminService.deleteDtlCd(idx);
    return { success: true };
  }
}
