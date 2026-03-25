import { Injectable, NestMiddleware } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Request, Response, NextFunction } from "express";
import { AuthService } from "../../modules/auth/auth.service";

export interface AuthUser {
  memberId: string;
  email: string;
  name?: string;
  level?: number;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private authService: AuthService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    if (accessToken) {
      try {
        const payload = this.jwtService.verify(accessToken, {
          secret: this.configService.get<string>("JWT_SECRET"),
        });

        (req as any).user = {
          memberId: payload.sub,
          email: payload.email,
          name: payload.name,
          level: payload.level,
        } as AuthUser;
      } catch (error) {
        // accessToken이 만료되었거나 유효하지 않음
        res.clearCookie("accessToken");

        // refreshToken이 있으면 갱신 시도
        if (refreshToken) {
          await this.tryRefresh(req, res, refreshToken, accessToken);
        }
      }
    } else if (refreshToken) {
      // accessToken이 없는데 refreshToken은 있는 경우 (만료되어 삭제되었거나 등)
      await this.tryRefresh(req, res, refreshToken);
    }

    next();
  }

  private async tryRefresh(
    req: Request,
    res: Response,
    refreshToken: string,
    oldAccessToken?: string,
  ) {
    try {
      const result = await this.authService.refreshTokens(
        refreshToken,
        oldAccessToken || "",
      );

      // 새 accessToken 쿠키 설정 (1시간)
      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 1000,
      });

      // 요청 객체에 유저 정보 설정
      const payload = this.jwtService.decode(result.accessToken) as any;
      (req as any).user = {
        memberId: payload.sub,
        email: payload.email,
        name: payload.name,
        level: payload.level,
      } as AuthUser;
    } catch (refreshError) {
      // 리프레시 토큰도 만료되었거나 유효하지 않음
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
    }
  }
}
