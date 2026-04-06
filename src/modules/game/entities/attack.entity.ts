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
import { Member } from "../../auth/entities/member.entity";

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

  @Column({ name: "DECK_DESC1", type: "varchar", length: 1000, nullable: true })
  deckDesc1: string;

  @Column({ name: "DECK_DESC2", type: "varchar", length: 1000, nullable: true })
  deckDesc2: string;

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
