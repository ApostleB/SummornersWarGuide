import { Controller, Get, Param, Render } from "@nestjs/common";
import { TodoService } from "./todo.service";

@Controller("todo")
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  @Render("todo/index")
  async list() {
    const todos = await this.todoService.findAllPlan();
    return { todos };
  }

  @Get(":plan_id")
  @Render("todo/detail")
  async detail(@Param("plan_id") planId: string) {
    const plan = await this.todoService.findPlanDetail(planId);
    return { plan };
  }
}
