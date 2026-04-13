import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DtlCd, YesNo } from "../code/entities/dtl-cd.entity";
import { GrpCd } from "../code/entities/grp-cd.entity";
import { Board } from "../board/entities/board.entity";

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(DtlCd)
    private dtlCdRepository: Repository<DtlCd>,
    @InjectRepository(GrpCd)
    private grpCdRepository: Repository<GrpCd>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  // ========== 메인 관리 ==========

  async getMainContent(): Promise<DtlCd> {
    return this.dtlCdRepository.findOne({ where: { code: "MCONT001" } });
  }

  async updateMainContent(data: {
    codeValue?: string;
    codeAttr1?: string | null;
    codeAttr2?: string | null;
    codeAttr3?: string | null;
  }): Promise<void> {
    await this.dtlCdRepository.update({ code: "MCONT001" }, data);
  }

  // ========== 코드 관리 ==========

  async getBoardList(boardType: string): Promise<Board[]> {
    return this.boardRepository.find({
      where: { boardType },
      order: { boardOrder: "ASC" },
    });
  }

  async createBoard(data: Partial<Board>): Promise<Board> {
    const board = this.boardRepository.create({
      ...data,
      useYn: data.useYn || YesNo.Y,
    });
    return this.boardRepository.save(board);
  }

  async updateBoard(boardId: string, data: Partial<Board>): Promise<void> {
    await this.boardRepository.update({ boardId }, data);
  }

  async deleteBoard(boardId: string): Promise<void> {
    await this.boardRepository.update({ boardId }, { useYn: YesNo.N });
  }

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
