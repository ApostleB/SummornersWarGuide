import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

export enum YesNo {
  Y = "Y",
  N = "N",
}

@Entity("DTL_CD")
export class DtlCd {
  @PrimaryGeneratedColumn({ name: "IDX" })
  idx: number;

  @Column({ name: "CODE", type: "varchar", length: 100 })
  code: string;

  @Column({ name: "GRP_CD", type: "varchar", length: 100 })
  grpCd: string;

  @Column({ name: "CODE_TITLE", type: "varchar", length: 200 })
  codeTitle: string;

  @Column({ name: "CODE_VALUE", type: "varchar", length: 200 })
  codeValue: string;

  @Column({ name: "CODE_ATTR1", type: "varchar", length: 200, nullable: true })
  codeAttr1: string;

  @Column({ name: "CODE_ATTR2", type: "varchar", length: 200, nullable: true })
  codeAttr2: string;

  @Column({ name: "CODE_ATTR3", type: "varchar", length: 200, nullable: true })
  codeAttr3: string;

  @Column({ name: "DEL_YN", type: "enum", enum: YesNo, default: YesNo.N })
  delYn: YesNo;

  @Column({ name: "USE_YN", type: "enum", enum: YesNo, default: YesNo.Y })
  useYn: YesNo;
}
