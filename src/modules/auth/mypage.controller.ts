import { Controller, Get, Render, Req } from "@nestjs/common";
import { Request } from "express";

@Controller("mypage")
export class MypageController {
  @Get()
  @Render("mypage/index")
  mypagePage(@Req() req: Request) {
    return { user: req.user || null };
  }
}
