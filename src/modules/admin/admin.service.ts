import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Defence } from "../game/entities/defence.entity";
import { Repository } from "typeorm";
import { Attack } from "../game/entities/attack.entity";
import { DtlCd } from "../code/entities/dtl-cd.entity";

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Defence)
    private defenceRepository: Repository<Defence>,
    @InjectRepository(Attack)
    private attackRepository: Repository<Attack>,
    @InjectRepository(DtlCd)
    private dtlCdRepository: Repository<DtlCd>,
  ) {}

  async defenceArraySave(xlsxArr: Array<any>): Promise<string> {
    // MONSTER_TYPE_CODE 그룹의 DTL_CD를 한 번에 조회하여 캐싱
    const monsterTypeCodes = await this.dtlCdRepository.find({
      where: { grpCd: "MONSTER_TYPE_CODE" },
    });

    // codeTitle로 배열에서 검색
    const findTypeByTitle = (title: string): DtlCd | null => {
      if (!title) return null;
      return monsterTypeCodes.find((dtlCd) => dtlCd.codeTitle === title) || null;
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
          typeA: findTypeByTitle( getTypeTitle(clean(element["방덱리더"])) ),
          monsterB: clean(element["방덱2"]),
          typeB: findTypeByTitle( getTypeTitle(clean(element["방덱2"])) ),
          monsterC: clean(element["방덱3"]),
          typeC: findTypeByTitle( getTypeTitle(clean(element["방덱3"])) ),
          description: clean(element["비고"]),
        };

        const attackData = {
          monsterA: clean(element["공덱리더"]),
          typeA: findTypeByTitle( getTypeTitle(clean(element["공덱리더"])) ),
          monsterB: clean(element["공덱2"]),
          typeB: findTypeByTitle( getTypeTitle(clean(element["공덱2"])) ),
          monsterC: clean(element["공덱3"]),
          typeC: findTypeByTitle( getTypeTitle(clean(element["공덱3"])) ),
          deckDesc: clean(element["비고"]),
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
            deckDesc: attackData.deckDesc,
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
            deckDesc: attackData.deckDesc,
            defence: defence,
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
