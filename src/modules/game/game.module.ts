import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GameController } from "./game.controller";
import { GameService } from "./game.service";
import { GameViewController } from "./game-view.controller";
import { Defence } from "./entities/defence.entity";
import { Attack } from "./entities/attack.entity";
import { DtlCd } from "../code/entities/dtl-cd.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Defence, Attack, DtlCd])],
  controllers: [GameController, GameViewController],
  providers: [GameService],
})
export class GameModule {}
