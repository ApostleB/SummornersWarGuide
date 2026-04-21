import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { Board } from "./board.entity";
import { Member } from "../../auth/entities/member.entity";

enum YesNo {
  Y = "Y",
  N = "N",
}

@Entity("BOARD_FILE")
export class BoardFile {
  @PrimaryColumn({ name: "FILE_ID", type: "uuid" })
  fileId: string;

  @Column({ name: "BOARD_ID", type: "uuid", nullable: true })
  boardId: string;

  @ManyToOne(() => Board)
  @JoinColumn({ name: "BOARD_ID" })
  board: Board;

  @Column({ name: "FILE_PATH", type: "varchar", length: 500, nullable: true })
  filePath: string;

  @Column({ name: "FILE_EXT", type: "varchar", length: 10, nullable: true })
  fileExt: string;

  @Column({ name: "FILE_ORD", type: "int", default: 0, comment: "파일 순서" })
  fileOrd: number;

  @Column({ name: "DEL_YN", type: "enum", enum: YesNo, default: YesNo.N })
  delYn: YesNo;

  @CreateDateColumn({ name: "INPUT_DT" })
  inputDt: Date;

  @Column({ name: "INPUT_ID", type: "uuid", nullable: true })
  inputId: string;

  @ManyToOne(() => Member)
  @JoinColumn({ name: "INPUT_ID", referencedColumnName: "memberId" })
  inputMember: Member;

  @BeforeInsert()
  generateId() {
    if (!this.fileId) {
      this.fileId = uuidv4();
    }
  }
}
