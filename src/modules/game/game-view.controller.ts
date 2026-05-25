import { Controller, Get, Render, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { GameService } from "./game.service";
import { MinLevel } from "../auth/decorators/min-level.decorator";

@UseGuards(JwtAuthGuard)
@Controller("game")
@MinLevel("10")
export class GameViewController {
  constructor(private readonly gameService: GameService) {}

  @Get(["/", "defence"])
  @Render("game/defence")
  async defence(@Req() req: Request) {
    const { defenceCount, attackCount } = await this.gameService.getStats();
    const bestKeywords = await this.gameService.getBestKeywords();
    return { user: req.user || null, defenceCount, attackCount, bestKeywords };
  }

  @Get("register")
  @Render("game/register")
  register(@Req() req: Request) {
    return { user: req.user || null };
  }
}
