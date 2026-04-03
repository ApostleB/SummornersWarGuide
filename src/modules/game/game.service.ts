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
      .leftJoin("defence.attackList", "attack")
      .addSelect("COUNT(attack.attackId)", "attackCount")
      .addSelect("MAX(attack.inputDt)", "lastAttackDate")
      .groupBy("defence.defenceId")
      .addGroupBy("mAType.code")
      .addGroupBy("mBType.code")
      .addGroupBy("mCType.code");

    if (keyword) {
      query.where(
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

  async getDefenceDetail(defenceId: string): Promise<any> {
    const defence = await this.defenceRepository
      .createQueryBuilder("defence")
      .leftJoinAndSelect("defence.attackList", "attackList")
      .leftJoinAndSelect("attackList.monsterAType", "amAType")
      .leftJoinAndSelect("attackList.monsterBType", "amBType")
      .leftJoinAndSelect("attackList.monsterCType", "amCType")
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
        deckDesc: attack.deckDesc,
        inputDt: attack.inputDt,
      })),
    };
  }
}
