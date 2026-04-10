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

  // ========== 방덱관리 ==========
  @Get("game/request")
  @Render("admin/game/request")
  adminGameRequest(@Req() req: Request) {
    return { user: req.user || null };
  }

  @Get("game/defence")
  @Render("admin/game/defence")
  adminGameDefence(@Req() req: Request) {
    return { user: req.user || null };
  }

  // ========== 회원관리 ==========
  @Get("member/request")
  @Render("admin/member/request")
  adminMemberRequest(@Req() req: Request) {
    return { user: req.user || null };
  }

  @Get("member")
  @Render("admin/member/member")
  adminMember(@Req() req: Request) {
    return { user: req.user || null };
  }

  // ========== 코드 관리 ==========
  @Get("code/main")
  @Render("admin/code/main")
  adminCodeMain(@Req() req: Request) {
    return { user: req.user || null };
  }

  @MinLevel("99")
  @Get("code")
  @Render("admin/code/code")
  adminCode(@Req() req: Request) {
    return { user: req.user || null };
  }
}
