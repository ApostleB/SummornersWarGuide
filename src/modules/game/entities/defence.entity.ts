import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { Attack } from "./attack.entity";
import { DtlCd } from "../../code/entities/dtl-cd.entity";

@Entity("DEFENCE_DECK")
export class Defence {
  @PrimaryColumn({ name: "DEFENCE_ID", type: "uuid" })
  defenceId: string;

  @Column({ name: "MONSTER_A", type: "varchar", length: 100, nullable: true })
  monsterA: string;

  @ManyToOne(() => DtlCd)
  @JoinColumn({ name: "MONSTER_A_TYPE", referencedColumnName: "code" })
  monsterAType: DtlCd;

  @Column({ name: "MONSTER_B", type: "varchar", length: 100, nullable: true })
  monsterB: string;

  @ManyToOne(() => DtlCd)
  @JoinColumn({ name: "MONSTER_B_TYPE", referencedColumnName: "code" })
  monsterBType: DtlCd;

  @Column({ name: "MONSTER_C", type: "varchar", length: 100, nullable: true })
  monsterC: string;

  @ManyToOne(() => DtlCd)
  @JoinColumn({ name: "MONSTER_C_TYPE", referencedColumnName: "code" })
  monsterCType: DtlCd;

  @Column({ name: "DECK_DESC", type: "varchar", length: 1000, nullable: true })
  description: string;

  @Column({ name: "INPUT_ID", type: "uuid", nullable: true })
  inputId: string;

  @CreateDateColumn({ name: "INPUT_DT" })
  inputDt: Date;

  @Column({ name: "UPDATE_ID", type: "uuid", nullable: true })
  updateId: string;

  @Column({ name: "UPDATE_DT", type: "datetime", nullable: true })
  updateDt: Date;

  @OneToMany(() => Attack, (attack) => attack.defence)
  attackList: Attack[];

  @BeforeInsert()
  generateId() {
    if (!this.defenceId) {
      this.defenceId = uuidv4();
    }
  }
}
