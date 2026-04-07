import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Get,
  Query,
  Res,
  HttpStatus,
  Delete,
  Param,
  Put,
  Body,
  Req,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { AdminGameService } from "./game.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { MinLevel } from "../../auth/decorators/min-level.decorator";
import { GameService as GameModuleService } from "../../game/game.service";
import { FileService } from "../../../common/file/file.service";
import { Request, Response } from "express";
import { AuthUser } from "../../../common/middlewares/auth.middleware";

const multerOptions = {
  storage: memoryStorage(),
};

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/admin")
export class AdminGameController {
  constructor(
    private readonly adminGameService: AdminGameService,
    private readonly fileService: FileService,
    private readonly gameService: GameModuleService,
  ) {}

  @MinLevel("99")
  @Post("file/defence")
  @UseInterceptors(FileInterceptor("file", multerOptions))
  async uploadDefenceFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException("File is required");
    }
    const user = req.user as AuthUser;
    const data = await this.fileService.readExcel(file);
    await this.adminGameService.defenceArraySave(data, user.memberId);
    return { success: true, data };
  }

  @Get("defence")
  async defenceList(@Query("keyword") keyword: string, @Res() res: Response) {
    const defenceList = await this.gameService.getDefenceList(keyword);
    return res.status(HttpStatus.OK).json(defenceList);
  }

  @MinLevel("99")
  @Delete("defence/:defenceId")
  async deleteDefence(@Param("defenceId") defenceId: string) {
    await this.adminGameService.deleteDefence(defenceId);
    return { success: true };
  }

  @Put("attack/:attackId")
  async updateAttack(
    @Param("attackId") attackId: string,
    @Body() updateData: any,
    @Req() req: Request,
  ) {
    const user = req.user as AuthUser;
    await this.adminGameService.updateAttack(attackId, updateData, user.memberId);
    return { success: true };
  }

  @MinLevel("99")
  @Delete("attack/:attackId")
  async deleteAttack(@Param("attackId") attackId: string) {
    await this.adminGameService.deleteAttack(attackId);
    return { success: true };
  }
}
