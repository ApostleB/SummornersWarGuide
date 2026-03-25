import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { Monster } from "./monster.entity";
import { AttackDeck } from "./attack.entity";

@Entity("DEFENCE_DECK")
export class DefenceDeck {
  @PrimaryColumn({ name: "DEFENCE_ID", type: "uuid" })
  defenceId: string;

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

  @OneToMany(() => AttackDeck, (attack) => attack.defence)
  attackList: AttackDeck[];

  @Column({ name: "INPUT_ID", type: "uuid", nullable: true })
  inputId: string;

  @Column({ name: "INPUT_DT", type: "datetime", nullable: true, insert: false, update: false })
  inputDt: Date;

  @Column({ name: "UPDATE_ID", type: "uuid", nullable: true })
  updateId: string;

  @Column({ name: "UPDATE_DT", type: "datetime", nullable: true, insert: false, update: false })
  updateDt: Date;

  @BeforeInsert()
  generateId() {
    if (!this.defenceId) {
      this.defenceId = uuidv4();
    }
  }
}
