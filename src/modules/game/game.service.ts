import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DefenceDeck } from "./entities/defence.entity";
import { Monster } from "./entities/monster.entity";
import { DtlCd } from "../code/entities/dtl-cd.entity";

interface MonsterTypeInfo {
  typeName: string;
  typeColor: string;
  typeImg: string;
}

@Injectable()
export class GameService {
  private monsterTypeCache: Map<string, MonsterTypeInfo> = new Map();

  constructor(
    @InjectRepository(DefenceDeck)
    private defenceDeckRepository: Repository<DefenceDeck>,
    @InjectRepository(Monster)
    private monsterRepository: Repository<Monster>,
    @InjectRepository(DtlCd)
    private dtlCdRepository: Repository<DtlCd>,
  ) {}

  private async getMonsterTypeInfo(monsterType: string): Promise<MonsterTypeInfo | null> {
    if (!monsterType) return null;

    if (this.monsterTypeCache.has(monsterType)) {
      return this.monsterTypeCache.get(monsterType);
    }

    const dtlCd = await this.dtlCdRepository.findOne({
      where: { code: monsterType, grpCd: "MONSTER_CODE" },
    });

    if (dtlCd) {
      const typeInfo: MonsterTypeInfo = {
        typeName: dtlCd.codeTitle,
        typeColor: dtlCd.codeValue,
        typeImg: dtlCd.codeAttr1,
      };
      this.monsterTypeCache.set(monsterType, typeInfo);
      return typeInfo;
    }

    return null;
  }

  private async mapMonsterWithType(monster: Monster) {
    if (!monster) return null;

    const typeInfo = await this.getMonsterTypeInfo(monster.monsterType);

    return {
      monsterName: monster.monsterName,
      monsterType: monster.monsterType,
      monsterDesc: monster.monsterDesc,
      typeName: typeInfo?.typeName || null,
      typeColor: typeInfo?.typeColor || null,
      typeImg: typeInfo?.typeImg || null,
    };
  }

  async getDefenceList(searchKeyword?: string) {
    const queryBuilder = this.defenceDeckRepository
      .createQueryBuilder("defence")
      .leftJoinAndSelect("defence.monsterA", "monsterA")
      .leftJoinAndSelect("defence.monsterB", "monsterB")
      .leftJoinAndSelect("defence.monsterC", "monsterC")
      .leftJoinAndSelect("defence.attackList", "attackList")
      .leftJoinAndSelect("attackList.monsterA", "attackMonsterA")
      .leftJoinAndSelect("attackList.monsterB", "attackMonsterB")
      .leftJoinAndSelect("attackList.monsterC", "attackMonsterC");

    if (searchKeyword) {
      queryBuilder.where(
        "monsterA.monsterName LIKE :keyword OR monsterB.monsterName LIKE :keyword OR monsterC.monsterName LIKE :keyword",
        { keyword: `%${searchKeyword}%` },
      );
    }

    const defenceList = await queryBuilder.getMany();

    const result = await Promise.all(
      defenceList.map(async (defence) => ({
        defenceId: defence.defenceId,
        defenceMonsterA: await this.mapMonsterWithType(defence.monsterA),
        defenceMonsterB: await this.mapMonsterWithType(defence.monsterB),
        defenceMonsterC: await this.mapMonsterWithType(defence.monsterC),
        attackList: await Promise.all(
          (defence.attackList || []).map(async (attack) => ({
            attackId: attack.attackId,
            attackMonsterA: await this.mapMonsterWithType(attack.monsterA),
            attackMonsterB: await this.mapMonsterWithType(attack.monsterB),
            attackMonsterC: await this.mapMonsterWithType(attack.monsterC),
            deckDesc: attack.deckDesc,
          })),
        ),
      })),
    );

    return result;
  }

  async getDefenceDetail(defenceId: string) {
    const defence = await this.defenceDeckRepository
      .createQueryBuilder("defence")
      .leftJoinAndSelect("defence.monsterA", "monsterA")
      .leftJoinAndSelect("defence.monsterB", "monsterB")
      .leftJoinAndSelect("defence.monsterC", "monsterC")
      .leftJoinAndSelect("defence.attackList", "attackList")
      .leftJoinAndSelect("attackList.monsterA", "attackMonsterA")
      .leftJoinAndSelect("attackList.monsterB", "attackMonsterB")
      .leftJoinAndSelect("attackList.monsterC", "attackMonsterC")
      .where("defence.defenceId = :defenceId", { defenceId })
      .getOne();

    if (!defence) {
      return null;
    }

    return {
      defenceId: defence.defenceId,
      defenceMonsterA: await this.mapMonsterWithType(defence.monsterA),
      defenceMonsterB: await this.mapMonsterWithType(defence.monsterB),
      defenceMonsterC: await this.mapMonsterWithType(defence.monsterC),
      attackList: await Promise.all(
        (defence.attackList || []).map(async (attack) => ({
          attackId: attack.attackId,
          attackMonsterA: await this.mapMonsterWithType(attack.monsterA),
          attackMonsterB: await this.mapMonsterWithType(attack.monsterB),
          attackMonsterC: await this.mapMonsterWithType(attack.monsterC),
          deckDesc: attack.deckDesc,
        })),
      ),
    };
  }

  async getMonsterSuggestions(keyword: string): Promise<string[]> {
    if (!keyword) {
      return [];
    }

    const monsters = await this.monsterRepository
      .createQueryBuilder("monster")
      .select("monster.monsterName")
      .where("monster.monsterName LIKE :keyword", { keyword: `%${keyword}%` })
      .distinct(true)
      .limit(10)
      .getMany();

    return monsters.map((m) => m.monsterName);
  }
}
