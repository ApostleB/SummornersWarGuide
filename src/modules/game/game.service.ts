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
      typeCode: typeInfo?.code,
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
      .leftJoinAndSelect("defence.attackList", "attackList")
      .leftJoinAndSelect("attackList.monsterAType", "amAType")
      .leftJoinAndSelect("attackList.monsterBType", "amBType")
      .leftJoinAndSelect("attackList.monsterCType", "amCType")
      .orderBy("defence.inputDt", "DESC");

    if (keyword) {
      query.where(
        "(defence.monsterA LIKE :keyword OR defence.monsterB LIKE :keyword OR defence.monsterC LIKE :keyword)",
        { keyword: `%${keyword}%` },
      );
    }

    const defenceList = await query.getMany();

    return {
      defenceList: defenceList.map((defence) => ({
        defenceId: defence.defenceId,
        defenceMonsterA: this.mapMonsterInfo(defence.monsterA, defence.monsterAType),
        defenceMonsterB: this.mapMonsterInfo(defence.monsterB, defence.monsterBType),
        defenceMonsterC: this.mapMonsterInfo(defence.monsterC, defence.monsterCType),
        attackList: (defence.attackList || []).map((attack) => ({
          attackId: attack.attackId,
          attackMonsterA: this.mapMonsterInfo(attack.monsterA, attack.monsterAType),
          attackMonsterB: this.mapMonsterInfo(attack.monsterB, attack.monsterBType),
          attackMonsterC: this.mapMonsterInfo(attack.monsterC, attack.monsterCType),
          deckDesc: attack.deckDesc,
        })),
      })),
    };
  }

  async getDefenceDetail(defenceId: string): Promise<any> {
    const defence = await this.defenceRepository
      .createQueryBuilder("defence")
      .leftJoinAndSelect("defence.monsterAType", "mAType")
      .leftJoinAndSelect("defence.monsterBType", "mBType")
      .leftJoinAndSelect("defence.monsterCType", "mCType")
      .leftJoinAndSelect("defence.attackList", "attackList")
      .leftJoinAndSelect("attackList.monsterAType", "amAType")
      .leftJoinAndSelect("attackList.monsterBType", "amBType")
      .leftJoinAndSelect("attackList.monsterCType", "amCType")
      .where("defence.defenceId = :defenceId", { defenceId })
      .getOne();

    if (!defence) {
      throw new NotFoundException("방어 덱을 찾을 수 없습니다.");
    }

    return {
      defence: {
        defenceId: defence.defenceId,
        defenceMonsterA: this.mapMonsterInfo(defence.monsterA, defence.monsterAType),
        defenceMonsterB: this.mapMonsterInfo(defence.monsterB, defence.monsterBType),
        defenceMonsterC: this.mapMonsterInfo(defence.monsterC, defence.monsterCType),
        description: defence.description,
        attackList: (defence.attackList || []).map((attack) => ({
          attackId: attack.attackId,
          attackMonsterA: this.mapMonsterInfo(attack.monsterA, attack.monsterAType),
          attackMonsterB: this.mapMonsterInfo(attack.monsterB, attack.monsterBType),
          attackMonsterC: this.mapMonsterInfo(attack.monsterC, attack.monsterCType),
          deckDesc: attack.deckDesc,
        })),
      },
    };
  }
}
