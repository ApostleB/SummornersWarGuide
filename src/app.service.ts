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

  async getGuestContent(): Promise<{ text: string; images: string[] }> {
    const contentCd = await this.dtlCdRepository.findOne({
      where: { code: "MCONT003" },
    });
    const images = [contentCd?.codeAttr1, contentCd?.codeAttr2, contentCd?.codeAttr3]
      .filter(Boolean);
    return {
      text: contentCd?.codeValue || "",
      images,
    };
  }

  async getMainContent(): Promise<{ text: string; images: string[] }> {
    const contentCd = await this.dtlCdRepository.findOne({
      where: { code: "MCONT001" },
    });
    const images = [contentCd?.codeAttr1, contentCd?.codeAttr2, contentCd?.codeAttr3]
      .filter(Boolean);
    return {
      text: contentCd?.codeValue || "",
      images,
    };
  }
}
