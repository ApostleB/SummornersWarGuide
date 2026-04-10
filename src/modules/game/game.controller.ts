import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  Body,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import { Response, Request } from "express";
import { GameService } from "./game.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AuthUser } from "../../common/middlewares/auth.middleware";

@UseGuards(JwtAuthGuard)
@Controller("api/game")
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get("defence")
  async defenceList(@Query("keyword") keyword: string, @Res() res: Response) {
    const defenceList = await this.gameService.getDefenceList(keyword);
    return res.status(HttpStatus.OK).json(defenceList);
  }

  @Get("defence/:defenceId")
  async getDefenceDetail(@Req() req: Request, @Res() res: Response) {
    const defenceId = req.params.defenceId;
    const defence = await this.gameService.getDefenceDetail(defenceId);
    if (!defence) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: "방어 덱을 찾을 수 없습니다." });
    }
    return res.status(HttpStatus.OK).json(defence);
  }

  // 몬스터 자동완성 검색
  @Get("monsters/search")
  async searchMonsters(@Query("keyword") keyword: string) {
    const monsters = await this.gameService.searchMonsters(keyword);
    return { success: true, monsters };
  }

  // 방덱 등록 신청
  @Post("deck/register")
  async registerDeck(@Body() data: any, @Req() req: Request) {
    const user = req.user as AuthUser;
    const result = await this.gameService.registerDeck({
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
}
