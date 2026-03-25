import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { AuthUser } from "../../../common/middlewares/auth.middleware";

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthUser;

    console.log('[RolesGuard] Access attempt by user:', user);

    if (!user) {
      console.log('[RolesGuard] Denied: No user in request');
      throw new ForbiddenException("로그인이 필요합니다.");
    }

    // DB에서 가져온 레벨이 문자열일 가능성을 배제하기 위해 Number() 처리
    if (Number(user.level) !== 99) {
      console.log(`[RolesGuard] Denied: Level ${user.level} is not 99`);
      throw new ForbiddenException("99레벨 관리자만 접근 가능합니다.");
    }

    console.log('[RolesGuard] Access Granted');
    return true;
  }
}
