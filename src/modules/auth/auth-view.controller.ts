import { Controller, Get, Render } from "@nestjs/common";

@Controller("auth")
export class AuthViewController {
  @Get("login")
  @Render("auth/login")
  loginPage() {
    return {};
  }

  @Get("signup")
  @Render("auth/signup")
  signupPage() {
    return {};
  }
}
