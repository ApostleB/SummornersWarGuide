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
import { Member } from "../../auth/entities/member.entity";
import { Attack } from "./attack.entity";
import { Defence } from "./defence.entity";

@Entity("DECK_LOG")
export class DeckLog {
  @PrimaryColumn({ name: "DECK_LOG_ID", type: "uuid" })
  deckLogId: string;

  @Column({ name: "LOG_TYPE", type: "varchar", length: 100, nullable: true })
  logType: string;

  @Column({ name: "LOG_ACTION", type: "varchar", length: 100, nullable: true })
  logAction: string;

  @Column({ name: "ATTACK_DECK_ID", type: "uuid", nullable: true })
  attackDeckId: string;

  @ManyToOne(() => Attack)
  @JoinColumn({ name: "ATTACK_DECK_ID" })
  attackDeck: Attack;

  @Column({ name: "DEFENCE_DECK_ID", type: "uuid", nullable: true })
  defenceDeckId: string;

  @ManyToOne(() => Defence)
  @JoinColumn({ name: "DEFENCE_DECK_ID" })
  defenceDeck: Defence;

  @Column({ name: "LOG_CONTENT", type: "varchar", length: 500, nullable: true })
  logContent: string;

  @Column({ name: "INPUT_ID", type: "uuid", nullable: true })
  inputId: string;

  @ManyToOne(() => Member)
  @JoinColumn({ name: "INPUT_ID", referencedColumnName: "memberId" })
  inputMember: Member;

  @CreateDateColumn({ name: "INPUT_DT" })
  inputDt: Date;

  @BeforeInsert()
  generateId() {
    if (!this.deckLogId) {
      this.deckLogId = uuidv4();
    }
  }
}
