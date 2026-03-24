import { Controller, Get, Render, Req } from "@nestjs/common";
import { Request } from "express";

@Controller("auth")
export class AuthViewController {
  @Get("login")
  @Render("auth/login")
  loginPage(@Req() req: Request) {
    return { user: req.user || null };
  }

  @Get("signup")
  @Render("auth/signup")
  signupPage(@Req() req: Request) {
    return { user: req.user || null };
  }
}
