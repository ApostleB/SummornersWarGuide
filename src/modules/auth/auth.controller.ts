import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpStatus,
} from "@nestjs/common";
import { Response, Request } from "express";
import { AuthService } from "./auth.service";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";
import { AuthUser } from "../../common/middlewares/auth.middleware";

@Controller("api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  async signup(@Body() signupDto: SignupDto, @Res() res: Response) {
    const result = await this.authService.signup(signupDto);
    return res.status(HttpStatus.CREATED).json(result);
  }

  @Post("login")
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const result = await this.authService.login(loginDto);

    // httpOnly 쿠키에 토큰 저장
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000, // 1시간
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    });

    return res.status(HttpStatus.OK).json(result);
  }

  @Get("logout")
  async logout(@Req() req: Request, @Res() res: Response) {
    const user = (req as any).user as AuthUser | undefined;

    if (user) {
      await this.authService.logout(user.memberId);
    }

    // 쿠키 삭제
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(HttpStatus.OK).json({ message: "로그아웃 되었습니다." });
  }

  @Post("refresh")
  async refreshTokens(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    const accessToken = req.cookies?.accessToken;

    if (!refreshToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: "세션이 만료되었습니다. 다시 로그인해주세요.",
      });
    }

    try {
      const result = await this.authService.refreshTokens(
        refreshToken,
        accessToken || "",
      );

      // 새 accessToken 쿠키 설정
      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 1000,
      });

      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: "세션이 만료되었습니다. 다시 로그인해주세요.",
      });
    }
  }
}
