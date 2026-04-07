import { Controller, Get, Render, Req } from "@nestjs/common";
import { Request } from "express";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DtlCd } from "../code/entities/dtl-cd.entity";

@Controller("auth")
export class AuthViewController {
  constructor(
    @InjectRepository(DtlCd)
    private dtlCdRepository: Repository<DtlCd>,
  ) {}

  @Get("login")
  @Render("auth/login")
  async loginPage(@Req() req: Request) {
    const contentCd = await this.dtlCdRepository.findOne({
      where: { code: "MCONT003" },
    });
    return {
      user: req.user || null,
      content: contentCd ? contentCd.codeValue : "",
    };
  }

  @Get("signup")
  @Render("auth/signup")
  async signupPage(@Req() req: Request) {
    const contentCd = await this.dtlCdRepository.findOne({
      where: { code: "MCONT004" },
    });
    return {
      user: req.user || null,
      content: contentCd ? contentCd.codeValue : "",
    };
  }
}
