import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum YesNo {
  Y = "Y",
  N = "N",
}

@Entity("GRP_CD")
export class GrpCd {
  @PrimaryGeneratedColumn({ name: "IDX" })
  idx: number;

  @Column({
    name: "GROUP_CODE_ID",
    type: "varchar",
    length: 100,
    nullable: true,
  })
  groupCodeId: string;

  @Column({ name: "GROUP_TITLE", type: "varchar", length: 100, nullable: true })
  groupTitle: string;

  @Column({ name: "GROUP_VALUE", type: "varchar", length: 100, nullable: true })
  groupValue: string;

  @Column({ name: "GROUP_ATTR1", type: "varchar", length: 200, nullable: true })
  groupAttr1: string;

  @Column({ name: "GROUP_ATTR2", type: "varchar", length: 200, nullable: true })
  groupAttr2: string;

  @Column({ name: "INPUT_ID", type: "uuid", nullable: true })
  inputId: string;

  @CreateDateColumn({ name: "INPUT_DT" })
  inputDt: Date;

  @Column({ name: "UPDATE_ID", type: "uuid", nullable: true })
  updateId: string;

  @UpdateDateColumn({ name: "UPDATE_DT", nullable: true })
  updateDt: Date;

  @Column({ name: "DEL_YN", type: "enum", enum: YesNo, default: YesNo.N })
  delYn: YesNo;

  @Column({ name: "USE_YN", type: "enum", enum: YesNo, default: YesNo.Y })
  useYn: YesNo;
}
