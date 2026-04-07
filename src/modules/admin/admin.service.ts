import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DtlCd, YesNo } from "../code/entities/dtl-cd.entity";
import { GrpCd } from "../code/entities/grp-cd.entity";

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(DtlCd)
    private dtlCdRepository: Repository<DtlCd>,
    @InjectRepository(GrpCd)
    private grpCdRepository: Repository<GrpCd>,
  ) {}

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
