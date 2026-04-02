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
      .leftJoinAndSelect("attackList.monsterCType", "amCType");

    if (keyword) {
      query.where(
        "(defence.monsterA LIKE :keyword OR defence.monsterB LIKE :keyword OR defence.monsterC LIKE :keyword)",
        { keyword: `%${keyword}%` },
      );
    }

    let defenceList = await query.getMany();

    // 정렬 로직
    // 1순위: monsterA에 keyword 매칭
    // 2순위: monsterB에 keyword 매칭
    // 3순위: monsterC에 keyword 매칭
    // 4순위: attackList 최신 등록일
    // 5순위: defence 등록일
    const getSortPriority = (defence: Defence): number => {
      if (!keyword) return 4;
      if (defence.monsterA?.includes(keyword)) return 1;
      if (defence.monsterB?.includes(keyword)) return 2;
      if (defence.monsterC?.includes(keyword)) return 3;
      return 4;
    };

    const getLatestAttackDate = (defence: Defence): Date | null => {
      if (!defence.attackList || defence.attackList.length === 0) return null;
      return defence.attackList.reduce((latest, attack) => {
          const attackDate = new Date(attack.inputDt);
          return !latest || attackDate > latest ? attackDate : latest;
        },
        null as Date | null,
      );
    };

    defenceList = defenceList.sort((a, b) => {
      // 1~3순위: keyword 매칭 위치
      const priorityA = getSortPriority(a);
      const priorityB = getSortPriority(b);
      if (priorityA !== priorityB) return priorityA - priorityB;

      // 4순위: attackList 최신 등록일
      const latestA = getLatestAttackDate(a);
      const latestB = getLatestAttackDate(b);

      if (latestA && latestB) {
        return latestB.getTime() - latestA.getTime();
      }
      if (latestA && !latestB) return -1;
      if (!latestA && latestB) return 1;

      // 5순위: defence 등록일
      return new Date(b.inputDt).getTime() - new Date(a.inputDt).getTime();
    });

    return {
      defenceList: defenceList.map((defence) => ({
        defenceId: defence.defenceId,
        _priority: getSortPriority(defence), // 디버깅용
        defenceMonsterA: this.mapMonsterInfo(defence.monsterA, defence.monsterAType),
        defenceMonsterB: this.mapMonsterInfo(defence.monsterB, defence.monsterBType),
        defenceMonsterC: this.mapMonsterInfo(defence.monsterC, defence.monsterCType),
        attackList: (defence.attackList || [])
          .sort((a, b) => new Date(b.inputDt).getTime() - new Date(a.inputDt).getTime())
          .map((attack) => ({
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
