import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
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
}
