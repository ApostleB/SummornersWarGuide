import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DefenceDeck } from "./entities/defence.entity";
import { Monster } from "./entities/monster.entity";

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(DefenceDeck)
    private defenceDeckRepository: Repository<DefenceDeck>,
    @InjectRepository(Monster)
    private monsterRepository: Repository<Monster>,
  ) {}

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
        { keyword: `${searchKeyword}%` },
      );
    }

    const defenceList = await queryBuilder.getMany();
    console.log(defenceList);

    return defenceList.map((defence) => ({
      defenceId: defence.defenceId,
      defenceMonsterA: defence.monsterA
        ? {
            monsterName: defence.monsterA.monsterName,
            monsterType: defence.monsterA.monsterType,
            monsterDesc: defence.monsterA.monsterDesc,
          }
        : null,
      defenceMonsterB: defence.monsterB
        ? {
            monsterName: defence.monsterB.monsterName,
            monsterType: defence.monsterB.monsterType,
            monsterDesc: defence.monsterB.monsterDesc,
          }
        : null,
      defenceMonsterC: defence.monsterC
        ? {
            monsterName: defence.monsterC.monsterName,
            monsterType: defence.monsterC.monsterType,
            monsterDesc: defence.monsterC.monsterDesc,
          }
        : null,
      attackList:
        defence.attackList?.map((attack) => ({
          attackId: attack.attackId,
          attackMonsterA: attack.monsterA
            ? {
                monsterName: attack.monsterA.monsterName,
                monsterType: attack.monsterA.monsterType,
                monsterDesc: attack.monsterA.monsterDesc,
              }
            : null,
          attackMonsterB: attack.monsterB
            ? {
                monsterName: attack.monsterB.monsterName,
                monsterType: attack.monsterB.monsterType,
                monsterDesc: attack.monsterB.monsterDesc,
              }
            : null,
          attackMonsterC: attack.monsterC
            ? {
                monsterName: attack.monsterC.monsterName,
                monsterType: attack.monsterC.monsterType,
                monsterDesc: attack.monsterC.monsterDesc,
              }
            : null,
          deckDesc: attack.deckDesc,
        })) || [],
    }));
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
      defenceMonsterA: defence.monsterA
        ? {
            monsterName: defence.monsterA.monsterName,
            monsterType: defence.monsterA.monsterType,
            monsterDesc: defence.monsterA.monsterDesc,
          }
        : null,
      defenceMonsterB: defence.monsterB
        ? {
            monsterName: defence.monsterB.monsterName,
            monsterType: defence.monsterB.monsterType,
            monsterDesc: defence.monsterB.monsterDesc,
          }
        : null,
      defenceMonsterC: defence.monsterC
        ? {
            monsterName: defence.monsterC.monsterName,
            monsterType: defence.monsterC.monsterType,
            monsterDesc: defence.monsterC.monsterDesc,
          }
        : null,
      attackList:
        defence.attackList?.map((attack) => ({
          attackId: attack.attackId,
          attackMonsterA: attack.monsterA
            ? {
                monsterName: attack.monsterA.monsterName,
                monsterType: attack.monsterA.monsterType,
                monsterDesc: attack.monsterA.monsterDesc,
              }
            : null,
          attackMonsterB: attack.monsterB
            ? {
                monsterName: attack.monsterB.monsterName,
                monsterType: attack.monsterB.monsterType,
                monsterDesc: attack.monsterB.monsterDesc,
              }
            : null,
          attackMonsterC: attack.monsterC
            ? {
                monsterName: attack.monsterC.monsterName,
                monsterType: attack.monsterC.monsterType,
                monsterDesc: attack.monsterC.monsterDesc,
              }
            : null,
          deckDesc: attack.deckDesc,
        })) || [],
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
