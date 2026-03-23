import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Plan } from "./plan.entity";
import { PlanTodo } from "./plan-todo.entity";

@Entity("PLAN_SECTION")
export class PlanSection {
  @PrimaryGeneratedColumn("uuid", { name: "PLAN_SECTION_ID" })
  planSectionId: string;

  @Column({ name: "PLAN_ID", type: "uuid", nullable: true })
  planId: string;

  @Column({ name: "PLAN_SECTION_TITLE", length: 100, nullable: true })
  planSectionTitle: string;

  @Column({
    name: "PLAN_SECTION_ORD",
    type: "int",
    nullable: true,
    comment: "섹션 정렬",
  })
  planSectionOrd: number;

  @CreateDateColumn({ name: "INPUT_DT", type: "datetime" })
  inputDt: Date;

  @UpdateDateColumn({ name: "UPDATE_DT", type: "datetime", nullable: true })
  updateDt: Date;

  @Column({ name: "DEL_YN", type: "enum", enum: ["Y", "N"], nullable: true })
  delYn: "Y" | "N";

  @ManyToOne(() => Plan, (plan) => plan.sections)
  @JoinColumn({ name: "PLAN_ID" })
  plan: Plan;

  @OneToMany(() => PlanTodo, (todo) => todo.section)
  todos: PlanTodo[];
}
