import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
} from "typeorm";
import { v4 as uuidv4 } from "uuid";

@Entity("MONSTER")
export class Monster {
  @PrimaryColumn({ name: "MONSTER_ID", type: "uuid" })
  monsterId: string;

  @Column({ name: "MONSTER_NAME", type: "varchar", length: 100 })
  monsterName: string;

  @Column({ name: "MONSTER_DESC", type: "varchar", length: 200 })
  monsterDesc: string;

  @Column({ name: "MONSTER_TYPE", type: "varchar", length: 200 })
  monsterType: string;

  @Column({ name: "INPUT_ID", type: "uuid", nullable: true })
  inputId: string;

  @Column({ name: "INPUT_DT", type: "datetime", nullable: true })
  inputDt: Date;

  @Column({ name: "UPDATE_ID", type: "uuid", nullable: true })
  updateId: string;

  @Column({ name: "UPDATE_DT", type: "datetime", nullable: true })
  updateDt: Date;

  @BeforeInsert()
  generateId() {
    if (!this.monsterId) {
      this.monsterId = uuidv4();
    }
  }
}
