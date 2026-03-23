import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Plan } from "./entities/plan.entity";
import { PlanSection } from "./entities/plan-section.entity";
import { PlanTodo } from "./entities/plan-todo.entity";

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
    @InjectRepository(PlanSection)
    private sectionRepository: Repository<PlanSection>,
    @InjectRepository(PlanTodo)
    private todoRepository: Repository<PlanTodo>,
  ) {}

  // /todo: plan_todo의 리스트만 주는 API
  async findAllPlan(): Promise<Plan[]> {
    return this.planRepository.find({
      where: { isDel: "N" },
      order: { planOrder: "ASC", inputDt: "DESC" },
    });
  }

  // /todo/{plan_id}: 그 플랜의 연관된 테이블들을 다 받아서 뿌려주는 API
  async findPlanDetail(planId: string): Promise<Plan> {
    return this.planRepository.findOne({
      where: { planId, isDel: "N" },
      relations: ["sections", "sections.todos", "todos"],
      order: {
        planOrder: "ASC",
        sections: {
          planSectionOrd: "ASC",
        },
        todos: {
          planTodoOrder: "ASC",
        },
      },
    });
  }
}
