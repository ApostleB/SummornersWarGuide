import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { Monster } from "./monster.entity";
import { DefenceDeck } from "./defence.entity";

@Entity("ATTACK_DECK")
export class AttackDeck {
  @PrimaryColumn({ name: "ATTACK_ID", type: "uuid" })
  attackId: string;

  @ManyToOne(() => DefenceDeck, { nullable: true })
  @JoinColumn({ name: "DEFENCE_ID" })
  defence: DefenceDeck;

  @ManyToOne(() => Monster, { nullable: true })
  @JoinColumn({ name: "MONSTER_A" })
  monsterA: Monster;

  @ManyToOne(() => Monster, { nullable: true })
  @JoinColumn({ name: "MONSTER_B" })
  monsterB: Monster;

  @ManyToOne(() => Monster, { nullable: true })
  @JoinColumn({ name: "MONSTER_C" })
  monsterC: Monster;

  @Column({ name: "DECK_DESC", type: "varchar", length: 1000, nullable: true })
  deckDesc: string;

  @Column({ name: "INPUT_ID", type: "uuid", nullable: true })
  inputId: string;

  @Column({ name: "INPUT_DT", type: "datetime", precision: 6, insert: false, update: false })
  inputDt: Date;

  @Column({ name: "UPDATE_ID", type: "uuid", nullable: true })
  updateId: string;

  @Column({ name: "UPDATE_DT", type: "datetime", precision: 6, nullable: true, insert: false, update: false })
  updateDt: Date;

  @BeforeInsert()
  generateId() {
    if (!this.attackId) {
      this.attackId = uuidv4();
    }
  }
}
