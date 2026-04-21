import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  PrimaryColumn, BeforeInsert,
} from "typeorm";
import { Member } from "../../auth/entities/member.entity";
import { BoardFile } from "./board-file.entity";
import { v4 as uuidv4 } from "uuid";

export enum YesNo {
  Y = "Y",
  N = "N",
}

@Entity("BOARD")
export class Board {
  @PrimaryColumn({ name: "BOARD_ID", type: "uuid" })
  boardId: string;

  @Column({ name: "BOARD_TYPE", type: "varchar", length: 100 })
  boardType: string;

  @Column({ name: "BOARD_TITLE", type: "varchar", length: 200 })
  boardTitle: string;

  @Column({ name: "BOARD_CONTENT", type: "text" })
  boardContent: string;

  @Column({ name: "BOARD_ORDER", type: "bigint", default: 0 })
  boardOrder: bigint;

  @Column({ name: "USE_YN", type: "enum", enum: YesNo, default: YesNo.Y })
  useYn: YesNo;

  @Column({ name: "DEL_YN", type: "enum", enum: YesNo, default: YesNo.N })
  delYn: YesNo;

  @Column({ name: "INPUT_ID", type: "uuid", nullable: true })
  inputId: string;

  @ManyToOne(() => Member)
  @JoinColumn({ name: "INPUT_ID", referencedColumnName: "memberId" })
  inputMember: Member;

  @CreateDateColumn({ name: "INPUT_DT" })
  inputDt: Date;

  @Column({ name: "UPDATE_ID", type: "uuid", nullable: true })
  updateId: string;

  @ManyToOne(() => Member)
  @JoinColumn({ name: "UPDATE_ID", referencedColumnName: "memberId" })
  updateMember: Member;

  @Column({ name: "UPDATE_DT", type: "datetime", nullable: true })
  updateDt: Date;

  @OneToMany(() => BoardFile, (boardFile) => boardFile.board)
  boardFileList: BoardFile[];

  @BeforeInsert()
  generateId() {
    if (!this.boardId) {
      this.boardId = uuidv4();
    }
  }
}
