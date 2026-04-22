import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In, Not } from "typeorm";
import { Member, MemberStatus } from "../../auth/entities/member.entity";
import { MemberLog, LogType } from "../../auth/entities/member-log.entity";
import { DtlCd, YesNo } from "../../code/entities/dtl-cd.entity";
import * as bcrypt from "bcrypt";

@Injectable()
export class AdminMemberService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(MemberLog)
    private memberLogRepository: Repository<MemberLog>,
    @InjectRepository(DtlCd)
    private dtlCdRepository: Repository<DtlCd>,
  ) {}

  async getPendingMembers(): Promise<Member[]> {
    return this.memberRepository.find({
      where: {
        status: In([MemberStatus.WAIT, MemberStatus.REJECT, MemberStatus.FAIL]),
      },
      order: { inputDt: "DESC" },
    });
  }

  async updateMemberStatus(
    memberId: string,
    status: MemberStatus,
  ): Promise<void> {
    await this.memberRepository.update(memberId, { status });
  }

  async getAllMembers(): Promise<(Omit<Member, 'generateId'> & { lastRefreshDt: Date | null })[]> {
    const members = await this.memberRepository.find({
      where: {
        status: Not(
          In([MemberStatus.WAIT, MemberStatus.REJECT, MemberStatus.FAIL]),
        ),
      },
      order: { inputDt: "DESC" },
    });

    const memberIds = members.map((m) => m.memberId);
    if (memberIds.length === 0) return members.map((m) => ({ ...m, lastRefreshDt: null }));

    const refreshLogs = await this.memberLogRepository
      .createQueryBuilder("log")
      .select("log.memberId", "memberId")
      .addSelect("MAX(log.inputDt)", "lastRefreshDt")
      .where("log.memberId IN (:...memberIds)", { memberIds })
      .andWhere("log.logType = :logType", { logType: LogType.REFRESH })
      .groupBy("log.memberId")
      .getRawMany();

    const refreshMap = new Map(refreshLogs.map((r) => [r.memberId, r.lastRefreshDt]));

    return members.map((m) => ({
      ...m,
      lastRefreshDt: refreshMap.get(m.memberId) ?? null,
    }));
  }

  async resetMemberPassword(memberId: string): Promise<void> {
    const defaultPwConfig = await this.dtlCdRepository.findOne({
      where: { grpCd: "MEMBER_MANAGE", code: "REG002" },
    });

    if (!defaultPwConfig) {
      throw new Error(
        "초기 비밀번호 설정(DEFAULT_PASSWORD)을 찾을 수 없습니다.",
      );
    }

    const hashedPassword = await bcrypt.hash(defaultPwConfig.codeValue, 10);
    await this.memberRepository.update(memberId, {
      memberPw: hashedPassword,
      loginCnt: 0,
    });
  }

  async kickMember(memberId: string): Promise<void> {
    await this.memberRepository.delete(memberId);
  }

  async getMemberLogs(memberId: string): Promise<MemberLog[]> {
    return this.memberLogRepository.find({
      where: { memberId },
      order: { inputDt: "DESC" },
      take: 50,
    });
  }

  async getMemberLevelCodes(): Promise<
    { code: string; codeTitle: string; codeValue: string }[]
  > {
    const codes = await this.dtlCdRepository.find({
      where: {
        grpCd: "MEMBER_LEVEL",
        delYn: YesNo.N,
        useYn: YesNo.Y,
      },
      order: { codeValue: "ASC" },
    });

    return codes.map((c) => ({
      code: c.code,
      codeTitle: c.codeTitle,
      codeValue: c.codeValue,
    }));
  }

  async getMemberStats(): Promise<{ totalCount: number; monthlyLoginCount: number }> {
    const totalCount = await this.memberRepository.count({
      where: {
        status: Not(In([MemberStatus.WAIT, MemberStatus.REJECT, MemberStatus.FAIL])),
      },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const monthlyLoginCount = await this.memberLogRepository
      .createQueryBuilder("log")
      .where("log.logType = :logType", { logType: LogType.LOGIN })
      .andWhere("log.logContent = :logContent", { logContent: "SUCCESS" })
      .andWhere("log.inputDt >= :startOfMonth", { startOfMonth })
      .andWhere("log.inputDt < :startOfNextMonth", { startOfNextMonth })
      .getCount();

    return { totalCount, monthlyLoginCount };
  }

  async updateMemberLevel(memberId: string, code: string): Promise<void> {
    const levelCode = await this.dtlCdRepository.findOne({
      where: {
        grpCd: "MEMBER_LEVEL",
        code: code,
      },
    });

    if (!levelCode) {
      throw new Error("유효하지 않은 권한 코드입니다.");
    }

    const memberLevel = parseInt(levelCode.codeValue, 10);
    await this.memberRepository.update(memberId, { memberLevel });
  }
}
