import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Plan } from "./plan.entity";
import { PlanSection } from "./plan-section.entity";

@Entity("PLAN_TODO")
export class PlanTodo {
  @PrimaryGeneratedColumn("uuid", { name: "PLAN_TODO_ID" })
  planTodoId: string;

  @Column({ name: "PLAN_ID", type: "uuid", nullable: true })
  planId: string;

  @Column({
    name: "PLAN_TODO_SECTION_ID",
    type: "uuid",
    nullable: true,
    comment: "섹션 그룹 번호",
  })
  planTodoSectionId: string;

  @Column({ name: "PLAN_TODO_TITLE", length: 200, nullable: true })
  planTodoTitle: string;

  @Column({
    name: "PLAN_TODO_CONTENT",
    length: 500,
    nullable: true,
    comment: "학습 예정일",
  })
  planTodoContent: string;

  @Column({
    name: "PLAN_TODO_DT",
    type: "datetime",
    nullable: true,
    comment: "학습 예정일",
  })
  planTodoDt: Date;

  @Column({
    name: "PLAN_COMPLETE_DT",
    type: "datetime",
    nullable: true,
    comment: "학습 완료일",
  })
  planCompleteDt: Date;

  @Column({ name: "PLAN_TODO_ORDER", type: "int", default: 0 })
  planTodoOrder: number;

  @CreateDateColumn({ name: "INPUT_DT", type: "datetime" })
  inputDt: Date;

  @UpdateDateColumn({ name: "UPDATE_DT", type: "datetime", nullable: true })
  updateDt: Date;

  @Column({ name: "DEL_YN", type: "enum", enum: ["Y", "N"], default: "N" })
  delYn: "Y" | "N";

  @ManyToOne(() => Plan, (plan) => plan.todos)
  @JoinColumn({ name: "PLAN_ID" })
  plan: Plan;

  @ManyToOne(() => PlanSection, (section) => section.todos)
  @JoinColumn({ name: "PLAN_TODO_SECTION_ID" })
  section: PlanSection;
}
