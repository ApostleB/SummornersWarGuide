import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DtlCd } from "./modules/code/entities/dtl-cd.entity";
import { Board, YesNo } from "./modules/board/entities/board.entity";
import { BoardFile } from "./modules/board/entities/board-file.entity";

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(DtlCd)
    private dtlCdRepository: Repository<DtlCd>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  async getGuestContent(): Promise<{ text: string; images: string[] }> {
    const contentCd = await this.dtlCdRepository.findOne({
      where: { code: "MCONT003" },
    });
    const images = [
      contentCd?.codeAttr1,
      contentCd?.codeAttr2,
      contentCd?.codeAttr3,
    ].filter(Boolean);
    return {
      text: contentCd?.codeValue || "",
      images,
    };
  }

  async getPatchNoteList(): Promise<Board[]> {
    return this.boardRepository.find({
      where: {
        boardType: "PATCH",
        useYn: YesNo.Y,
        delYn: YesNo.N,
      },
      relations: ["boardFileList", "inputMember"],
      order: { boardOrder: "DESC", inputDt: "DESC" },
    });
  }

  async getMainContent(): Promise<{ text: string; images: string[] }> {
    const contentCd = await this.dtlCdRepository.findOne({
      where: { code: "MCONT001" },
    });
    const images = [
      contentCd?.codeAttr1,
      contentCd?.codeAttr2,
      contentCd?.codeAttr3,
    ].filter(Boolean);
    return {
      text: contentCd?.codeValue || "",
      images,
    };
  }
}
