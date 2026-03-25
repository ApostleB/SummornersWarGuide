import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GameController } from "./game.controller";
import { GameViewController } from "./game-view.controller";
import { GameService } from "./game.service";
import { AuthModule } from "../auth/auth.module";
import { DefenceDeck } from "./entities/defence.entity";
import { Monster } from "./entities/monster.entity";
import { AttackDeck } from "./entities/attack.entity";

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([DefenceDeck, Monster, AttackDeck])],
  controllers: [GameController, GameViewController],
  providers: [GameService],
  exports: [GameService],
})
export class GameModule {}
