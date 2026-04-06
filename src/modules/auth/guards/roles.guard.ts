import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthUser } from "../../../common/middlewares/auth.middleware";
import { DtlCd, YesNo } from "../../code/entities/dtl-cd.entity";
import { MIN_LEVEL_KEY } from "../decorators/min-level.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(DtlCd)
    private dtlCdRepository: Repository<DtlCd>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthUser;

    if (!user) {
      throw new ForbiddenException("로그인이 필요합니다.");
    }

    // 메서드 또는 클래스에 설정된 MinLevel 데코레이터 값 가져오기
    const requiredLevelCode = this.reflector.getAllAndOverride<string>(
      MIN_LEVEL_KEY,
      [context.getHandler(), context.getClass()],
    );

    // MinLevel 데코레이터가 없으면 기본 관리자 권한(level > 0) 체크
    if (!requiredLevelCode) {
      if (Number(user.level) <= 0) {
        throw new ForbiddenException("관리자 권한이 필요합니다.");
      }
      return true;
    }

    // DB에서 해당 코드의 codeValue 조회
    const levelCode = await this.dtlCdRepository.findOne({
      where: {
        grpCd: "MEMBER_LEVEL",
        codeValue: user.level.toString(),
        delYn: YesNo.N,
        useYn: YesNo.Y,
      },
    });

    if (!levelCode) {
      throw new ForbiddenException("유효하지 않은 권한 설정입니다.");
    }

    const requiredLevel = parseInt(levelCode.codeValue, 10);
    const userLevel = Number(user.level);

    if (userLevel < requiredLevel) {
      throw new ForbiddenException(
        `${levelCode.codeTitle} 이상의 권한이 필요합니다.`,
      );
    }

    return true;
  }
}
