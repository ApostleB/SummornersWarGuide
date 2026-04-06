import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Defence } from "../game/entities/defence.entity";
import { Repository } from "typeorm";
import { Attack } from "../game/entities/attack.entity";
import { DtlCd, YesNo } from "../code/entities/dtl-cd.entity";
import { GrpCd } from "../code/entities/grp-cd.entity";

import { Member, MemberStatus } from "../auth/entities/member.entity";
import { MemberLog } from "../auth/entities/member-log.entity";
import * as bcrypt from "bcrypt";
import { In, Not } from "typeorm";

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Defence)
    private defenceRepository: Repository<Defence>,
    @InjectRepository(Attack)
    private attackRepository: Repository<Attack>,
    @InjectRepository(DtlCd)
    private dtlCdRepository: Repository<DtlCd>,
    @InjectRepository(GrpCd)
    private grpCdRepository: Repository<GrpCd>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(MemberLog)
    private memberLogRepository: Repository<MemberLog>,
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

  async getAllMembers(): Promise<Member[]> {
    return this.memberRepository.find({
      where: {
        status: Not(
          In([MemberStatus.WAIT, MemberStatus.REJECT, MemberStatus.FAIL]),
        ),
      },
      order: { inputDt: "DESC" },
    });
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
      loginCnt: 0, // 잠금 해제 효과
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

  async deleteDefence(defenceId: string): Promise<void> {
    await this.attackRepository.delete({ defenceId });
    await this.defenceRepository.delete(defenceId);
  }

  async deleteAttack(attackId: string): Promise<void> {
    await this.attackRepository.delete(attackId);
  }

  async updateAttack(attackId: string, updateData: any, memberId: string): Promise<void> {
    const attack = await this.attackRepository.findOne({ where: { attackId } });
    if (!attack) return;

    const monsterTypeCodes = await this.dtlCdRepository.find({
      where: { grpCd: "MONSTER_TYPE_CODE" },
    });

    const findTypeByTitle = (title: string): DtlCd | null => {
      if (!title) return null;
      return (
        monsterTypeCodes.find((dtlCd) => dtlCd.codeTitle === title) || null
      );
    };

    const getTypeTitle = (name: string) => (name ? name.slice(0, 1) : null);

    if (updateData.monsterA !== undefined) {
      attack.monsterA = updateData.monsterA;
      attack.monsterAType = findTypeByTitle(getTypeTitle(updateData.monsterA));
    }
    if (updateData.monsterB !== undefined) {
      attack.monsterB = updateData.monsterB;
      attack.monsterBType = findTypeByTitle(getTypeTitle(updateData.monsterB));
    }
    if (updateData.monsterC !== undefined) {
      attack.monsterC = updateData.monsterC;
      attack.monsterCType = findTypeByTitle(getTypeTitle(updateData.monsterC));
    }
    if (updateData.deckDesc1 !== undefined) {
      attack.deckDesc1 = updateData.deckDesc1;
    }
    if (updateData.deckDesc2 !== undefined) {
      attack.deckDesc2 = updateData.deckDesc2;
    }

    attack.updateId = memberId;
    attack.updateDt = new Date();

    await this.attackRepository.save(attack);
  }

  async defenceArraySave(
    xlsxArr: Array<any>,
    memberId: string,
  ): Promise<string> {
    // MONSTER_TYPE_CODE 그룹의 DTL_CD를 한 번에 조회하여 캐싱
    const monsterTypeCodes = await this.dtlCdRepository.find({
      where: { grpCd: "MONSTER_TYPE_CODE" },
    });

    // codeTitle로 배열에서 검색
    const findTypeByTitle = (title: string): DtlCd | null => {
      if (!title) return null;
      return (
        monsterTypeCodes.find((dtlCd) => dtlCd.codeTitle === title) || null
      );
    };

    if (xlsxArr.length > 0) {
      for (const element of xlsxArr) {
        const clean = (val: any) =>
          val
            ?.toString()
            .replace(/[\r\n\t\s]+/g, " ")
            .trim() || "";

        // 몬스터 이름에서 속성 추출 (첫 글자)
        const getTypeTitle = (name: string) => (name ? name.slice(0, 1) : null);

        const defenceData = {
          monsterA: clean(element["방덱리더"]),
          typeA: findTypeByTitle(getTypeTitle(clean(element["방덱리더"]))),
          monsterB: clean(element["방덱2"]),
          typeB: findTypeByTitle(getTypeTitle(clean(element["방덱2"]))),
          monsterC: clean(element["방덱3"]),
          typeC: findTypeByTitle(getTypeTitle(clean(element["방덱3"]))),
          description: clean(element["비고"]),
        };

        const attackData = {
          monsterA: clean(element["공덱리더"]),
          typeA: findTypeByTitle(getTypeTitle(clean(element["공덱리더"]))),
          monsterB: clean(element["공덱2"]),
          typeB: findTypeByTitle(getTypeTitle(clean(element["공덱2"]))),
          monsterC: clean(element["공덱3"]),
          typeC: findTypeByTitle(getTypeTitle(clean(element["공덱3"]))),
          deckDesc1: clean(element["비고1"]),
          deckDesc2: clean(element["비고2"]),
        };

        // 1. 방덱 중복 체크 및 저장
        let defence = await this.defenceRepository.findOne({
          where: {
            monsterA: defenceData.monsterA,
            monsterB: defenceData.monsterB,
            monsterC: defenceData.monsterC,
          },
        });

        if (!defence) {
          // 방덱이 없으면 새로 생성
          defence = this.defenceRepository.create({
            monsterA: defenceData.monsterA,
            monsterAType: defenceData.typeA,
            monsterB: defenceData.monsterB,
            monsterBType: defenceData.typeB,
            monsterC: defenceData.monsterC,
            monsterCType: defenceData.typeC,
            description: defenceData.description,
          });
          defence = await this.defenceRepository.save(defence);
          console.log(`[신규 방덱 저장] ID: ${defence.defenceId}`);
        }

        // 2. 공략덱 중복 체크 및 저장
        const existingAttack = await this.attackRepository.findOne({
          where: {
            defenceId: defence.defenceId,
            monsterA: attackData.monsterA,
            monsterB: attackData.monsterB,
            monsterC: attackData.monsterC,
            deckDesc1: attackData.deckDesc1,
            deckDesc2: attackData.deckDesc2,
          },
        });

        if (!existingAttack) {
          const newAttack = this.attackRepository.create({
            defenceId: defence.defenceId,
            monsterA: attackData.monsterA,
            monsterAType: attackData.typeA,
            monsterB: attackData.monsterB,
            monsterBType: attackData.typeB,
            monsterC: attackData.monsterC,
            monsterCType: attackData.typeC,
            deckDesc1: attackData.deckDesc1,
            deckDesc2: attackData.deckDesc2,
            defence: defence,
            inputId: memberId,
          });
          await this.attackRepository.save(newAttack);
          console.log(
            `  -> [신규 공략 저장] 방덱: ${defence.monsterA} <- 공략: ${attackData.monsterA}`,
          );
        } else {
          console.log(
            `  -> [중복 공략 건너뜀] 방덱: ${defence.monsterA} <- 공략: ${attackData.monsterA}`,
          );
        }
      }
    }

    return "Processing completed";
  }

  // ========== 코드 관리 ==========

  async getGrpCdList(): Promise<GrpCd[]> {
    return this.grpCdRepository.find({
      where: { delYn: YesNo.N },
      order: { groupCodeId: "ASC" },
    });
  }

  async getDtlCdList(grpCd: string): Promise<DtlCd[]> {
    return this.dtlCdRepository.find({
      where: { grpCd, delYn: YesNo.N },
      order: { code: "ASC" },
    });
  }

  async createDtlCd(data: Partial<DtlCd>): Promise<DtlCd> {
    const dtlCd = this.dtlCdRepository.create({
      ...data,
      delYn: YesNo.N,
      useYn: data.useYn || YesNo.Y,
    });
    return this.dtlCdRepository.save(dtlCd);
  }

  async updateDtlCd(idx: number, data: Partial<DtlCd>): Promise<void> {
    await this.dtlCdRepository.update(idx, data);
  }

  async deleteDtlCd(idx: number): Promise<void> {
    await this.dtlCdRepository.update(idx, { delYn: YesNo.Y });
  }
}
