import { Controller, Get, Render, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { MinLevel } from "../auth/decorators/min-level.decorator";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("admin")
export class AdminViewController {
  @Get()
  @Render("admin/index")
  adminIndex(@Req() req: Request) {
    return { user: req.user || null };
  }

  @Get("member")
  @Render("admin/member")
  adminMember(@Req() req: Request) {
    return { user: req.user || null };
  }

  @Get("defence")
  @Render("admin/defence")
  adminDefence(@Req() req: Request) {
    return { user: req.user || null };
  }

  @MinLevel("LV099")
  @Get("code")
  @Render("admin/code")
  adminCode(@Req() req: Request) {
    return { user: req.user || null };
  }
}
