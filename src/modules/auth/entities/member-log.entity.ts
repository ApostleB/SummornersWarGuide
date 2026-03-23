import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from "typeorm";

export enum LogType {
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  SIGNUP = "SIGNUP",
}

@Entity("MEMBER_LOG")
export class MemberLog {
  @PrimaryGeneratedColumn({ name: "LOG_IDX" })
  logIdx: number;

  @Column({ name: "MEMBER_ID", type: "uuid", nullable: true })
  memberId: string;

  @Column({ name: "LOG_TYPE", type: "varchar", length: 100, nullable: true })
  logType: LogType;

  @Column({ name: "LOG_CONTENT", type: "varchar", length: 200, nullable: true })
  logContent: string;

  @CreateDateColumn({ name: "INPUT_DT" })
  inputDt: Date;
}
