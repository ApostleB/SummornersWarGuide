import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Get,
  Query, Res, HttpStatus, Delete, Param, Put, Body
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GameService } from "../game/game.service";
import { FileService } from '../../common/file/file.service';
import {Response} from "express";

const multerOptions = {
  storage: memoryStorage(),
};

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/admin")
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly fileService: FileService,
    private readonly gameService: GameService,
  ) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const data = await this.fileService.readExcel(file);
    return { success: true, data };
  }

  @Post("file/defence")
  @UseInterceptors(FileInterceptor("file", multerOptions))
  async uploadDefenceFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("File is required");
    }
    const data = await this.fileService.readExcel(file);
    await this.adminService.defenceArraySave(data);
    return { success: true, data };
  }

  @Get("defence")
  async defenceList(@Query("keyword") keyword: string, @Res() res: Response) {
    const defenceList = await this.gameService.getDefenceList(keyword);
    return res.status(HttpStatus.OK).json(defenceList);
  }

  @Delete("defence/:defenceId")
  async deleteDefence(@Param("defenceId") defenceId: string) {
    await this.adminService.deleteDefence(defenceId);
    return { success: true };
  }

  @Put("attack/:attackId")
  async updateAttack(
    @Param("attackId") attackId: string,
    @Body() updateData: any,
  ) {
    await this.adminService.updateAttack(attackId, updateData);
    return { success: true };
  }

  @Delete("attack/:attackId")
  async deleteAttack(@Param("attackId") attackId: string) {
    await this.adminService.deleteAttack(attackId);
    return { success: true };
  }

  @Get("members/pending")
  async getPendingMembers() {
    const members = await this.adminService.getPendingMembers();
    return { success: true, members };
  }

  @Put("members/:memberId/status")
  async updateMemberStatus(
    @Param("memberId") memberId: string,
    @Body("status") status: any,
  ) {
    await this.adminService.updateMemberStatus(memberId, status);
    return { success: true };
  }

  @Get("members")
  async getAllMembers() {
    const members = await this.adminService.getAllMembers();
    return { success: true, members };
  }

  @Put("members/:memberId/password-reset")
  async resetPassword(@Param("memberId") memberId: string) {
    await this.adminService.resetMemberPassword(memberId);
    return { success: true };
  }

  @Delete("members/:memberId")
  async kickMember(@Param("memberId") memberId: string) {
    await this.adminService.kickMember(memberId);
    return { success: true };
  }

  @Get("members/:memberId/logs")
  async getMemberLogs(@Param("memberId") memberId: string) {
    const logs = await this.adminService.getMemberLogs(memberId);
    return { success: true, logs };
  }
}
