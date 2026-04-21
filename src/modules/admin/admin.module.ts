import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminViewController } from "./admin-view.controller";
import { AdminGameController } from "./game/game.controller";
import { AdminMemberController } from "./member/member.controller";
import { AdminService } from "./admin.service";
import { AdminGameService } from "./game/game.service";
import { AdminMemberService } from "./member/member.service";
import { GameService } from "../game/game.service";
import { AuthModule } from "../auth/auth.module";
import { FileModule } from "../../common/file/file.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Defence } from "../game/entities/defence.entity";
import { Attack } from "../game/entities/attack.entity";
import { DeckLog } from "../game/entities/deck-log.entity";
import { DtlCd } from "../code/entities/dtl-cd.entity";
import { GrpCd } from "../code/entities/grp-cd.entity";
import { Member } from "../auth/entities/member.entity";
import { MemberLog } from "../auth/entities/member-log.entity";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Board } from "../board/entities/board.entity";
import { BoardFile } from "../board/entities/board-file.entity";

@Module({
  imports: [
    AuthModule,
    FileModule,
    TypeOrmModule.forFeature([
      Defence,
      Attack,
      DeckLog,
      DtlCd,
      GrpCd,
      Member,
      MemberLog,
      Board,
      BoardFile,
    ]),
  ],
  controllers: [
    AdminController,
    AdminViewController,
    AdminGameController,
    AdminMemberController,
  ],
  providers: [
    AdminService,
    AdminGameService,
    AdminMemberService,
    GameService,
    RolesGuard,
  ],
})
export class AdminModule {}
