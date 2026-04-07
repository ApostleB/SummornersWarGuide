import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DtlCd } from "./modules/code/entities/dtl-cd.entity";

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(DtlCd)
    private dtlCdRepository: Repository<DtlCd>,
  ) {}

  async getMainContent(): Promise<string> {
    const contentCd = await this.dtlCdRepository.findOne({
      where: { code: "MCONT001" },
    });
    return contentCd ? contentCd.codeValue : "";
  }
}
