import {
  Controller,
  Get,
  Query,
  Req,
  Res,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import { Response, Request } from "express";
import { GameService } from "./game.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

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
}
