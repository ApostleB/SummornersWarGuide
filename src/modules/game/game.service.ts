import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Defence } from "./entities/defence.entity";
import { Attack } from "./entities/attack.entity";
import { DtlCd } from "../code/entities/dtl-cd.entity";

@Injectable()
export class GameService {
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

  async getDefenceList(keyword: string): Promise<any> {
    const query = this.defenceRepository
      .createQueryBuilder("defence")
      .leftJoinAndSelect("defence.monsterAType", "mAType")
      .leftJoinAndSelect("defence.monsterBType", "mBType")
      .leftJoinAndSelect("defence.monsterCType", "mCType")
      .leftJoin("defence.attackList", "attack", "attack.confirmYn = :confirmYn", { confirmYn: "Y" })
      .addSelect("COUNT(attack.attackId)", "attackCount")
      .addSelect("MAX(attack.inputDt)", "lastAttackDate")
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
      query.addSelect(
        "CASE WHEN defence.monsterA LIKE :keyword THEN 0 ELSE 1 END",
        "matchA",
      );
      query.addSelect(
        "CASE WHEN defence.monsterB LIKE :keyword THEN 0 ELSE 1 END",
        "matchB",
      );
      query.addSelect(
        "CASE WHEN defence.monsterC LIKE :keyword THEN 0 ELSE 1 END",
        "matchC",
      );
      query.orderBy("matchA", "ASC");
      query.addOrderBy("matchB", "ASC");
      query.addOrderBy("matchC", "ASC");
    }

    query.addOrderBy("lastAttackDate", "DESC");
    query.addOrderBy("defence.inputDt", "DESC");

    const { entities, raw } = await query.getRawAndEntities();

    // raw 결과에서 attackCount를 매핑
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

  // 방덱 등록 신청
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

  async getDefenceDetail(defenceId: string): Promise<any> {
    const defence = await this.defenceRepository
      .createQueryBuilder("defence")
      .leftJoinAndSelect("defence.attackList", "attackList", "attackList.confirmYn = :confirmYn", { confirmYn: "Y" })
      .leftJoinAndSelect("attackList.monsterAType", "amAType")
      .leftJoinAndSelect("attackList.monsterBType", "amBType")
      .leftJoinAndSelect("attackList.monsterCType", "amCType")
      .leftJoinAndSelect("attackList.inputMember", "inputMember")
      .leftJoinAndSelect("attackList.updateMember", "updateMember")
      .where("defence.defenceId = :defenceId", { defenceId })
      .addOrderBy("attackList.inputDt", "DESC")
      .getOne();

    if (!defence) {
      throw new NotFoundException("방어 덱을 찾을 수 없습니다.");
    }

    return {
      attackList: (defence.attackList || []).map((attack) => ({
        attackId: attack.attackId,
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
        updateDt: attack.updateDt,
        updateMember: attack.updateMember
          ? {
              name: attack.updateMember.memberName,
              nickname: attack.updateMember.memberNickname,
            }
          : null,
      })),
    };
  }
}
