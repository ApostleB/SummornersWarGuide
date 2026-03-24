import { Injectable, NestMiddleware } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Request, Response, NextFunction } from "express";

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
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.accessToken;

    if (token) {
      try {
        const payload = this.jwtService.verify(token, {
          secret: this.configService.get<string>("JWT_SECRET"),
        });

        (req as any).user = {
          memberId: payload.sub,
          email: payload.email,
          name: payload.name,
          level: payload.level,
        } as AuthUser;
      } catch (error) {
        // 토큰이 만료되거나 유효하지 않은 경우 쿠키 삭제
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
      }
    }

    next();
  }
}
