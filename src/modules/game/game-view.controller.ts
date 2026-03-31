import { Controller, Get, Render, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller("game")
export class GameViewController {
  @Get(["/", "defence"])
  @Render("game/defence")
  defence(@Req() req: Request) {
    return { user: req.user || null };
  }

}
