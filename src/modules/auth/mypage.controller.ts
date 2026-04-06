import { Controller, Get, Render, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AuthService } from "./auth.service";

@Controller("mypage")
export class MypageController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @Render("mypage/index")
  async mypagePage(@Req() req: Request) {
    const memberId = (req.user as any).memberId;
    const member = await this.authService.validateUser(memberId);

    return {
      user: {
        memberId: member.memberId,
        memberName: member.memberName,
        memberAuth: member.memberAuth,
        level: member.memberLevel,
        memberNickname: member.memberNickname,
        inputDt: member.inputDt,
        loginDt: member.loginDt,
      },
    };
  }
}
