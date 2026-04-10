import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { Member, MemberStatus, SignupMessage, MemberWithAuth } from "./entities/member.entity";
import { MemberLog, LogType } from "./entities/member-log.entity";
import { DtlCd, YesNo } from "../code/entities/dtl-cd.entity";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { UpdateNicknameDto } from "./dto/update-nickname.dto";

@Injectable()
export class AuthService {
  private readonly MAX_LOGIN_ATTEMPTS = 10;

  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(MemberLog)
    private memberLogRepository: Repository<MemberLog>,
    @InjectRepository(DtlCd)
    private dtlCdRepository: Repository<DtlCd>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { password, name, regCode, nickname } = signupDto;

    // 아이디 중복 체크
    const existingMember = await this.memberRepository.exists({
      where: { memberName: name },
    });
    if (existingMember) {
      throw new BadRequestException("이미 등록된 아이디입니다.");
    }

    // 가입 코드 확인
    const regCodeCheck = await this.dtlCdRepository.findOne({
      where: { code: "REG001", useYn: YesNo.Y },
    });

    let regMessage = null;
    let status = null;

    if (regCodeCheck !== null) {
      const codeCheck = regCodeCheck.codeValue === regCode;
      if (codeCheck) {
        regMessage = SignupMessage.WAIT;
        status = MemberStatus.WAIT;
      } else {
        regMessage = SignupMessage.REJECT;
        status = MemberStatus.REJECT;
      }
    } else {
      regMessage = SignupMessage.FAIL;
      status = MemberStatus.FAIL;
    }

    if (status !== MemberStatus.WAIT) {
      throw new BadRequestException(regMessage);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const member = this.memberRepository.create({
      memberId: uuidv4(),
      memberName: name,
      memberPw: hashedPassword,
      memberNickname: nickname,
      regCode: regCode || null,
      status,
    });

    await this.memberRepository.save(member);
    await this.createLog(member.memberId, LogType.SIGNUP, status);

    return {
      message: regMessage,
      status,
    };
  }

  async login(loginDto: LoginDto) {
    const { name, password } = loginDto;

    const member = await this.memberRepository.findOne({
      where: { memberName: name },
    });

    if (!member) {
      throw new UnauthorizedException(
        "아이디 또는 비밀번호가 올바르지 않습니다.",
      );
    }

    // 계정 잠금 확인
    if (member.loginCnt >= this.MAX_LOGIN_ATTEMPTS) {
      await this.createLog(member.memberId, LogType.LOGIN, "LOCKED");
      throw new ForbiddenException(
        "로그인 시도 횟수를 초과하여 계정이 잠겼습니다. 관리자에게 문의하세요.",
      );
    }

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, member.memberPw);
    if (!isPasswordValid) {
      // 로그인 실패 카운트 증가
      await this.memberRepository.update(member.memberId, {
        loginCnt: member.loginCnt + 1,
      });
      await this.createLog(member.memberId, LogType.LOGIN, "FAILED");
      throw new UnauthorizedException(
        "아이디 또는 비밀번호가 올바르지 않습니다.",
      );
    }

    // 상태 확인 (SUCCESS 또는 CONFIRM만 로그인 가능)
    if (
      member.status !== MemberStatus.SUCCESS &&
      member.status !== MemberStatus.CONFIRM
    ) {
      await this.createLog(member.memberId, LogType.LOGIN, "STATUS_INVALID");
      throw new ForbiddenException("로그인이 허용되지 않은 계정입니다.");
    }

    // 토큰 생성
    const tokens = await this.generateTokens(member);

    // 로그인 성공 처리
    await this.memberRepository.update(member.memberId, {
      loginCnt: 0,
      loginDt: new Date(),
      refreshToken: tokens.refreshToken,
    });

    await this.createLog(member.memberId, LogType.LOGIN, "SUCCESS");

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      member: {
        memberId: member.memberId,
        name: member.memberName,
        nickname: member.memberNickname,
        level: member.memberLevel,
      },
    };
  }

  async logout(memberId: string) {
    await this.memberRepository.update(memberId, {
      refreshToken: null,
    });

    await this.createLog(memberId, LogType.LOGOUT, "SUCCESS");

    return { message: "로그아웃 되었습니다." };
  }

  async changePassword(memberId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    const member = await this.memberRepository.findOne({
      where: { memberId },
    });

    if (!member) {
      throw new BadRequestException("사용자를 찾을 수 없습니다.");
    }

    // 현재 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(currentPassword, member.memberPw);
    if (!isPasswordValid) {
      throw new BadRequestException("현재 비밀번호가 일치하지 않습니다.");
    }

    // 새 비밀번호 해시
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 비밀번호 업데이트
    await this.memberRepository.update(memberId, {
      memberPw: hashedPassword,
    });

    await this.createLog(memberId, LogType.LOGIN, "PASSWORD_CHANGED");

    return { message: "비밀번호가 성공적으로 변경되었습니다." };
  }

  async updateNickname(memberId: string, updateNicknameDto: UpdateNicknameDto) {
    const { nickname } = updateNicknameDto;

    // 닉네임 중복 체크
    const existingMember = await this.memberRepository.findOne({
      where: { memberNickname: nickname },
    });

    if (existingMember && existingMember.memberId !== memberId) {
      throw new BadRequestException("이미 사용 중인 닉네임입니다.");
    }

    await this.memberRepository.update(memberId, {
      memberNickname: nickname,
    });

    await this.createLog(memberId, LogType.LOGIN, "NICKNAME_CHANGED");

    return { message: "닉네임이 성공적으로 변경되었습니다.", nickname };
  }

  async refreshTokens(refreshToken: string, expiredAccessToken: string) {
    try {
      // Refresh token 검증
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      });

      const member = await this.memberRepository.findOne({
        where: { memberId: payload.sub },
      });

      if (!member || member.refreshToken !== refreshToken) {
        throw new UnauthorizedException("유효하지 않은 토큰입니다.");
      }

      // 새 access token 발급
      const newAccessToken = this.jwtService.sign(
        {
          sub: member.memberId,
          name: member.memberName,
          nickname: member.memberNickname,
          level: member.memberLevel,
        },
        {
          secret: this.configService.get<string>("JWT_SECRET"),
          expiresIn: "1h",
        },
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      // Refresh token이 만료된 경우
      if (error.name === "TokenExpiredError") {
        // 만료된 access token에서 member ID 추출
        const decoded = this.jwtService.decode(expiredAccessToken) as any;
        if (decoded?.sub) {
          await this.memberRepository.update(decoded.sub, {
            refreshToken: null,
          });
        }
        throw new UnauthorizedException(
          "세션이 만료되었습니다. 다시 로그인해주세요.",
        );
      }
      throw new UnauthorizedException("유효하지 않은 토큰입니다.");
    }
  }

  async validateUser(memberId: string): Promise<MemberWithAuth> {
    const result = await this.memberRepository
      .createQueryBuilder("member")
      .leftJoin(
        DtlCd,
        "levelCode",
        "levelCode.grpCd = :grpCd AND levelCode.codeValue = CAST(member.memberLevel AS CHAR)",
        { grpCd: "MEMBER_LEVEL" },
      )
      .addSelect("levelCode.codeTitle", "memberAuth")
      .where("member.memberId = :memberId", { memberId })
      .getRawAndEntities();

    const member = result.entities[0] as MemberWithAuth;

    if (!member) {
      throw new UnauthorizedException("사용자를 찾을 수 없습니다.");
    }

    const raw = result.raw[0];
    member.memberAuth = raw?.memberAuth || null;
    return member;
  }

  private async generateTokens(member: Member) {
    const payload = {
      sub: member.memberId,
      name: member.memberName,
      nickname: member.memberNickname,
      level: member.memberLevel,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_SECRET"),
      expiresIn: "1h",
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      expiresIn: "7d",
    });

    return { accessToken, refreshToken };
  }

  private async createLog(
    memberId: string,
    logType: LogType,
    logContent: string,
  ) {
    const log = this.memberLogRepository.create({
      memberId,
      logType,
      logContent,
    });
    await this.memberLogRepository.save(log);
  }
}
