import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like } from "typeorm";
import { Defence } from "../../game/entities/defence.entity";
import { Attack } from "../../game/entities/attack.entity";
import { DtlCd } from "../../code/entities/dtl-cd.entity";

@Injectable()
export class AdminGameService {
  constructor(
    @InjectRepository(Defence)
    private defenceRepository: Repository<Defence>,
    @InjectRepository(Attack)
    private attackRepository: Repository<Attack>,
    @InjectRepository(DtlCd)
    private dtlCdRepository: Repository<DtlCd>,
  ) {}

  private mapMonsterInfo(name: string, typeInfo: DtlCd) {
    if (!name) return null;
    return {
      monsterName: name,
      typeName: typeInfo?.codeTitle,
      typeColor: typeInfo?.codeValue,
      typeImg: typeInfo?.codeAttr1,
    };
  }

  // 몬스터 자동완성 검색
  async searchMonsters(keyword: string): Promise<string[]> {
    if (!keyword || keyword.length < 1) return [];

    const defenceA = await this.defenceRepository
      .createQueryBuilder("defence")
      .select("defence.monsterA", "monster")
      .where("defence.monsterA LIKE :keyword", { keyword: `%${keyword}%` })
      .getRawMany();

    const defenceB = await this.defenceRepository
      .createQueryBuilder("defence")
      .select("defence.monsterB", "monster")
      .where("defence.monsterB LIKE :keyword", { keyword: `%${keyword}%` })
      .getRawMany();

    const defenceC = await this.defenceRepository
      .createQueryBuilder("defence")
      .select("defence.monsterC", "monster")
      .where("defence.monsterC LIKE :keyword", { keyword: `%${keyword}%` })
      .getRawMany();

    const attackA = await this.attackRepository
      .createQueryBuilder("attack")
      .select("attack.monsterA", "monster")
      .where("attack.monsterA LIKE :keyword", { keyword: `%${keyword}%` })
      .getRawMany();

    const attackB = await this.attackRepository
      .createQueryBuilder("attack")
      .select("attack.monsterB", "monster")
      .where("attack.monsterB LIKE :keyword", { keyword: `%${keyword}%` })
      .getRawMany();

    const attackC = await this.attackRepository
      .createQueryBuilder("attack")
      .select("attack.monsterC", "monster")
      .where("attack.monsterC LIKE :keyword", { keyword: `%${keyword}%` })
      .getRawMany();

    const allMonsters = [
      ...defenceA,
      ...defenceB,
      ...defenceC,
      ...attackA,
      ...attackB,
      ...attackC,
    ].map((r) => r.monster);
    const uniqueMonsters = [...new Set(allMonsters)].filter(Boolean);
    return uniqueMonsters.slice(0, 10);
  }

  // 방덱 등록 (신규 or 기존 방덱에 공덱 추가)
  async registerDeck(data: {
    defenceMonsterA: string;
    defenceMonsterB: string;
    defenceMonsterC: string;
    attackMonsterA: string;
    attackMonsterB: string;
    attackMonsterC: string;
    deckDesc1: string;
    deckDesc2: string;
    memberId: string;
  }): Promise<{ success: boolean; message: string }> {
    const monsterTypeCodes = await this.dtlCdRepository.find({
      where: { grpCd: "MONSTER_TYPE_CODE" },
    });

    const findTypeByTitle = (title: string): DtlCd | null => {
      if (!title) return null;
      return monsterTypeCodes.find((dtlCd) => dtlCd.codeTitle === title) || null;
    };

    const getTypeTitle = (name: string) => (name ? name.slice(0, 1) : null);

    // 기존 방덱 찾기
    let defence = await this.defenceRepository.findOne({
      where: {
        monsterA: data.defenceMonsterA,
        monsterB: data.defenceMonsterB,
        monsterC: data.defenceMonsterC,
      },
    });

    // 방덱이 없으면 새로 생성 (confirmYn = 'N')
    if (!defence) {
      defence = this.defenceRepository.create({
        monsterA: data.defenceMonsterA,
        monsterAType: findTypeByTitle(getTypeTitle(data.defenceMonsterA)),
        monsterB: data.defenceMonsterB,
        monsterBType: findTypeByTitle(getTypeTitle(data.defenceMonsterB)),
        monsterC: data.defenceMonsterC,
        monsterCType: findTypeByTitle(getTypeTitle(data.defenceMonsterC)),
        inputId: data.memberId,
        confirmYn: "N",
      });
      defence = await this.defenceRepository.save(defence);
    }

    // 중복 공덱 체크
    const existingAttack = await this.attackRepository.findOne({
      where: {
        defenceId: defence.defenceId,
        monsterA: data.attackMonsterA,
        monsterB: data.attackMonsterB,
        monsterC: data.attackMonsterC,
        deckDesc1: data.deckDesc1 || "",
        deckDesc2: data.deckDesc2 || "",
      },
    });

    if (existingAttack) {
      return { success: false, message: "이미 동일한 공덱이 등록되어 있습니다." };
    }

    // 공덱 생성 (confirmYn = 'N')
    const newAttack = this.attackRepository.create({
      defenceId: defence.defenceId,
      monsterA: data.attackMonsterA,
      monsterAType: findTypeByTitle(getTypeTitle(data.attackMonsterA)),
      monsterB: data.attackMonsterB,
      monsterBType: findTypeByTitle(getTypeTitle(data.attackMonsterB)),
      monsterC: data.attackMonsterC,
      monsterCType: findTypeByTitle(getTypeTitle(data.attackMonsterC)),
      deckDesc1: data.deckDesc1 || "",
      deckDesc2: data.deckDesc2 || "",
      inputId: data.memberId,
      confirmYn: "N",
    });
    await this.attackRepository.save(newAttack);

    return { success: true, message: "등록 신청이 완료되었습니다." };
  }

  // 승인 대기 목록 조회 (confirmYn = 'N'인 공덱이 있는 방덱)
  async getPendingDefenceList(keyword?: string): Promise<any> {
    const query = this.defenceRepository
      .createQueryBuilder("defence")
      .leftJoinAndSelect("defence.monsterAType", "mAType")
      .leftJoinAndSelect("defence.monsterBType", "mBType")
      .leftJoinAndSelect("defence.monsterCType", "mCType")
      .leftJoin("defence.attackList", "attack", "attack.confirmYn = :pendingConfirm", { pendingConfirm: "N" })
      .addSelect("COUNT(attack.attackId)", "pendingCount")
      .having("COUNT(attack.attackId) > 0")
      .groupBy("defence.defenceId")
      .addGroupBy("mAType.code")
      .addGroupBy("mBType.code")
      .addGroupBy("mCType.code");

    if (keyword) {
      query.where(
        "(defence.monsterA LIKE :keyword OR defence.monsterB LIKE :keyword OR defence.monsterC LIKE :keyword)",
        { keyword: `%${keyword}%` },
      );
    }

    query.orderBy("defence.inputDt", "DESC");

    const { entities, raw } = await query.getRawAndEntities();

    const pendingCountMap = new Map<string, number>();
    raw.forEach((r) => {
      pendingCountMap.set(r.defence_DEFENCE_ID, parseInt(r.pendingCount) || 0);
    });

    return {
      defenceList: entities.map((defence) => ({
        defenceId: defence.defenceId,
        confirmYn: defence.confirmYn,
        defenceMonsterA: this.mapMonsterInfo(defence.monsterA, defence.monsterAType),
        defenceMonsterB: this.mapMonsterInfo(defence.monsterB, defence.monsterBType),
        defenceMonsterC: this.mapMonsterInfo(defence.monsterC, defence.monsterCType),
        pendingCount: pendingCountMap.get(defence.defenceId) || 0,
      })),
    };
  }

  // 승인 대기 공덱 상세 조회
  async getPendingAttackList(defenceId: string): Promise<any> {
    const attacks = await this.attackRepository
      .createQueryBuilder("attack")
      .leftJoinAndSelect("attack.monsterAType", "amAType")
      .leftJoinAndSelect("attack.monsterBType", "amBType")
      .leftJoinAndSelect("attack.monsterCType", "amCType")
      .leftJoinAndSelect("attack.inputMember", "inputMember")
      .where("attack.defenceId = :defenceId", { defenceId })
      .andWhere("attack.confirmYn = :confirmYn", { confirmYn: "N" })
      .orderBy("attack.inputDt", "DESC")
      .getMany();

    return {
      attackList: attacks.map((attack) => ({
        attackId: attack.attackId,
        confirmYn: attack.confirmYn,
        attackMonsterA: this.mapMonsterInfo(attack.monsterA, attack.monsterAType),
        attackMonsterB: this.mapMonsterInfo(attack.monsterB, attack.monsterBType),
        attackMonsterC: this.mapMonsterInfo(attack.monsterC, attack.monsterCType),
        deckDesc1: attack.deckDesc1,
        deckDesc2: attack.deckDesc2,
        inputDt: attack.inputDt,
        inputMember: attack.inputMember
          ? {
              name: attack.inputMember.memberName,
              nickname: attack.inputMember.memberNickname,
            }
          : null,
      })),
    };
  }

  // 방덱 승인
  async confirmDefence(defenceId: string): Promise<void> {
    await this.defenceRepository.update(defenceId, { confirmYn: "Y" });
  }

  // 공덱 승인
  async confirmAttack(attackId: string): Promise<void> {
    const attack = await this.attackRepository.findOne({ where: { attackId } });
    if (!attack) return;

    // 공덱 승인
    await this.attackRepository.update(attackId, { confirmYn: "Y" });

    // 해당 방덱도 승인 처리
    await this.defenceRepository.update(attack.defenceId, { confirmYn: "Y" });
  }

  // 확정된 방덱 목록 조회 (방덱 관리용)
  async getConfirmedDefenceList(keyword?: string): Promise<any> {
    const query = this.defenceRepository
      .createQueryBuilder("defence")
      .leftJoinAndSelect("defence.monsterAType", "mAType")
      .leftJoinAndSelect("defence.monsterBType", "mBType")
      .leftJoinAndSelect("defence.monsterCType", "mCType")
      .leftJoin("defence.attackList", "attack", "attack.confirmYn = :confirmYn", { confirmYn: "Y" })
      .addSelect("COUNT(attack.attackId)", "attackCount")
      .where("defence.confirmYn = :defenceConfirm", { defenceConfirm: "Y" })
      .groupBy("defence.defenceId")
      .addGroupBy("mAType.code")
      .addGroupBy("mBType.code")
      .addGroupBy("mCType.code");

    if (keyword) {
      query.andWhere(
        "(defence.monsterA LIKE :keyword OR defence.monsterB LIKE :keyword OR defence.monsterC LIKE :keyword)",
        { keyword: `%${keyword}%` },
      );
    }

    query.orderBy("defence.inputDt", "DESC");

    const { entities, raw } = await query.getRawAndEntities();

    const attackCountMap = new Map<string, number>();
    raw.forEach((r) => {
      attackCountMap.set(r.defence_DEFENCE_ID, parseInt(r.attackCount) || 0);
    });

    return {
      defenceList: entities.map((defence) => ({
        defenceId: defence.defenceId,
        defenceMonsterA: this.mapMonsterInfo(defence.monsterA, defence.monsterAType),
        defenceMonsterB: this.mapMonsterInfo(defence.monsterB, defence.monsterBType),
        defenceMonsterC: this.mapMonsterInfo(defence.monsterC, defence.monsterCType),
        attackCount: attackCountMap.get(defence.defenceId) || 0,
      })),
    };
  }

  async deleteDefence(defenceId: string): Promise<void> {
    await this.attackRepository.delete({ defenceId });
    await this.defenceRepository.delete(defenceId);
  }

  async deleteAttack(attackId: string): Promise<void> {
    await this.attackRepository.delete(attackId);
  }

  async updateAttack(
    attackId: string,
    updateData: any,
    memberId: string,
  ): Promise<void> {
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
    const monsterTypeCodes = await this.dtlCdRepository.find({
      where: { grpCd: "MONSTER_TYPE_CODE" },
    });

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

        let defence = await this.defenceRepository.findOne({
          where: {
            monsterA: defenceData.monsterA,
            monsterB: defenceData.monsterB,
            monsterC: defenceData.monsterC,
          },
        });

        if (!defence) {
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

        const existingAttack = await this.attackRepository.findOne({
          where: {
            defenceId: defence.defenceId,
            monsterA: attackData.monsterA,
            monsterB: attackData.monsterB,
            monsterC: attackData.monsterC,
            deckDesc1: attackData.deckDesc1,
            deckDesc2: attackData.deckDesc2,
            inputId: memberId,
            confirmYn: "Y",
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
            confirmYn: "Y",
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
}
