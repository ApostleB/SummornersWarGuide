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

  // 몬스터 자동완성 검색
  @Get("monsters/search")
  async searchMonsters(@Query("keyword") keyword: string) {
    const monsters = await this.adminGameService.searchMonsters(keyword);
    return { success: true, monsters };
  }

  // 방덱 등록 신청
  @Post("deck/register")
  async registerDeck(@Body() data: any, @Req() req: Request) {
    const user = req.user as AuthUser;
    const result = await this.adminGameService.registerDeck({
      defenceMonsterA: data.defenceMonsterA,
      defenceMonsterB: data.defenceMonsterB,
      defenceMonsterC: data.defenceMonsterC,
      attackMonsterA: data.attackMonsterA,
      attackMonsterB: data.attackMonsterB,
      attackMonsterC: data.attackMonsterC,
      deckDesc1: data.deckDesc1,
      deckDesc2: data.deckDesc2,
      memberId: user.memberId,
    });
    return result;
  }

  // 승인 대기 방덱 목록
  @Get("defence/pending")
  async pendingDefenceList(@Query("keyword") keyword: string) {
    const result = await this.adminGameService.getPendingDefenceList(keyword);
    return result;
  }

  // 승인 대기 공덱 상세
  @Get("defence/pending/:defenceId")
  async pendingAttackList(@Param("defenceId") defenceId: string) {
    const result = await this.adminGameService.getPendingAttackList(defenceId);
    return result;
  }

  // 방덱 승인
  @Put("defence/:defenceId/confirm")
  async confirmDefence(@Param("defenceId") defenceId: string) {
    await this.adminGameService.confirmDefence(defenceId);
    return { success: true };
  }

  // 공덱 승인
  @Put("attack/:attackId/confirm")
  async confirmAttack(@Param("attackId") attackId: string) {
    await this.adminGameService.confirmAttack(attackId);
    return { success: true };
  }

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

  // 확정된 방덱 목록 (방덱 관리용)
  @Get("defence")
  async defenceList(@Query("keyword") keyword: string, @Res() res: Response) {
    const result = await this.adminGameService.getConfirmedDefenceList(keyword);
    return res.status(HttpStatus.OK).json(result);
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
