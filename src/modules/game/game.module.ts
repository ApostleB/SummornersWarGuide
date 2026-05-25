import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GameController } from "./game.controller";
import { GameService } from "./game.service";
import { GameViewController } from "./game-view.controller";
import { Defence } from "./entities/defence.entity";
import { Attack } from "./entities/attack.entity";
import { DeckLog } from "./entities/deck-log.entity";
import { DtlCd } from "../code/entities/dtl-cd.entity";
import { Board } from "../board/entities/board.entity";
import { BoardFile } from "../board/entities/board-file.entity";
import { RolesGuard } from "../auth/guards/roles.guard";

@Module({
  imports: [
    TypeOrmModule.forFeature([Defence, Attack, DeckLog, DtlCd, Board, BoardFile]),
  ],
  controllers: [GameController, GameViewController],
  providers: [GameService, RolesGuard],
})
export class GameModule {}
