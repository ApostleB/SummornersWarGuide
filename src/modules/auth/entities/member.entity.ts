import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  BeforeInsert,
} from "typeorm";
import { v4 as uuidv4 } from "uuid";
export enum SignupMessage {
  SUCCESS = "가입이 승인되었습니다.",
  REJECT = "인증코드가 일치하지 않습니다..",
  WAIT = "가입에 성공했습니다.\n관리자 승인대기중입니다.",
}
export enum MemberStatus {
  SUCCESS = "SUCCESS",
  CONFIRM = "CONFIRM",
  REJECT = "REJECT",
  WAIT = "WAIT",
  FAIL = "FAIL",
}

@Entity("MEMBERS")
export class Member {
  @PrimaryColumn({ name: "MEMBER_ID", type: "uuid" })
  memberId: string;

  @Column({ name: "MEMBER_NAME", type: "varchar", length: 100, unique: true })
  memberName: string;

  @Column({
    name: "MEMBER_NICKNAME",
    type: "varchar",
    length: 100,
    unique: true,
  })
  memberNickname: string;

  @Column({ name: "MEMBER_PW", type: "varchar", length: 500 })
  memberPw: string;

  @Column({ name: "MEMBER_LEVEL", type: "int", default: 0 })
  memberLevel: number;

  @Column({ name: "REG_CODE", type: "varchar", length: 200, nullable: true })
  regCode: string;

  @Column({ name: "LOGIN_CNT", type: "int", default: 0 })
  loginCnt: number;

  @Column({
    name: "STATUS",
    type: "varchar",
    length: 100,
    default: MemberStatus.CONFIRM,
  })
  status: MemberStatus;

  @Column({
    name: "REFRESH_TOKEN",
    type: "varchar",
    length: 500,
    nullable: true,
  })
  refreshToken: string;

  @CreateDateColumn({ name: "INPUT_DT" })
  inputDt: Date;

  @Column({ name: "LOGIN_DT", type: "datetime", nullable: true })
  loginDt: Date;

  @BeforeInsert()
  generateId() {
    if (!this.memberId) {
      this.memberId = uuidv4();
    }
  }
}
