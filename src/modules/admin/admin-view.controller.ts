import { Controller, Get, Render, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { MinLevel } from "../auth/decorators/min-level.decorator";
import { DtlCd } from "../code/entities/dtl-cd.entity";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("admin")
export class AdminViewController {
  constructor(
    @InjectRepository(DtlCd)
    private dtlCdRepository: Repository<DtlCd>,
  ) {}

  @Get()
  @Render("admin/index")
  async adminIndex(@Req() req: Request) {
    const contentCd = await this.dtlCdRepository.findOne({
      where: { code: "MCONT002" },
    });
    return {
      user: req.user || null,
      content: contentCd ? contentCd.codeValue : "",
    };
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

  @MinLevel("99")
  @Get("code")
  @Render("admin/code")
  adminCode(@Req() req: Request) {
    return { user: req.user || null };
  }
}
