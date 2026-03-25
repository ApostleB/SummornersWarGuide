import { Controller, Get, Render, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("admin")
export class AdminViewController {
  @Get()
  @Render("admin/index")
  adminIndex(@Req() req: Request) {
    return { user: req.user || null };
  }
}
