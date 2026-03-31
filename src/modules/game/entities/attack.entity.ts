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
import { Defence } from "./defence.entity";
import { DtlCd } from "../../code/entities/dtl-cd.entity";

@Entity("ATTACK_DECK")
export class Attack {
  @PrimaryColumn({ name: "ATTACK_ID", type: "uuid" })
  attackId: string;

  @Column({ name: "DEFENCE_ID", type: "uuid" })
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
  deckDesc: string;

  @Column({ name: "INPUT_ID", type: "uuid", nullable: true })
  inputId: string;

  @CreateDateColumn({ name: "INPUT_DT" })
  inputDt: Date;

  @Column({ name: "UPDATE_ID", type: "uuid", nullable: true })
  updateId: string;

  @Column({ name: "UPDATE_DT", type: "datetime", nullable: true })
  updateDt: Date;

  @ManyToOne(() => Defence, (defence) => defence.attackList)
  @JoinColumn({ name: "DEFENCE_ID" })
  defence: Defence;

  @BeforeInsert()
  generateId() {
    if (!this.attackId) {
      this.attackId = uuidv4();
    }
  }
}
