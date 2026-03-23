import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TodoController } from "./todo.controller";
import { TodoService } from "./todo.service";
import { Plan } from "./entities/plan.entity";
import { PlanSection } from "./entities/plan-section.entity";
import { PlanTodo } from "./entities/plan-todo.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Plan, PlanSection, PlanTodo])],
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule {}
