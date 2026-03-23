import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { PlanSection } from "./plan-section.entity";
import { PlanTodo } from "./plan-todo.entity";

@Entity("PLAN")
export class Plan {
  @PrimaryGeneratedColumn("uuid", { name: "PLAN_ID" })
  planId: string;

  @Column({ name: "PLAN_TITLE", length: 200, nullable: true })
  planTitle: string;

  @Column({ name: "PLAN_ORDER", type: "int", default: 0 })
  planOrder: number;

  @Column({ name: "IS_DEL", type: "enum", enum: ["Y", "N"], default: "N" })
  isDel: "Y" | "N";

  @CreateDateColumn({ name: "INPUT_DT", type: "datetime" })
  inputDt: Date;

  @UpdateDateColumn({ name: "UPDATE_DT", type: "datetime", nullable: true })
  updateDt: Date;

  @Column({ name: "PLAN_START_DT", type: "datetime", nullable: true })
  planStartDt: Date;

  @Column({ name: "PLAN_END_DT", type: "datetime", nullable: true })
  planEndDt: Date;

  @OneToMany(() => PlanSection, (section) => section.plan)
  sections: PlanSection[];

  @OneToMany(() => PlanTodo, (todo) => todo.plan)
  todos: PlanTodo[];
}
