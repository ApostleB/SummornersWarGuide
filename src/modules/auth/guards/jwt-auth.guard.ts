import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    // AuthMiddleware에서 이미 유저 정보를 설정했다면 (리프레시 성공 등) 가드를 통과시킴
    if (request.user) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      const request = context.switchToHttp().getRequest();
      const response = context.switchToHttp().getResponse<Response>();

      // API 요청인 경우 UnauthorizedException 던지기
      if (request.url.startsWith("/api/")) {
        throw err || new UnauthorizedException("인증이 필요합니다.");
      }

      // View 요청인 경우 login 페이지로 redirect
      response.redirect("/auth/login");
      return null;
    }
    return user;
  }
}
