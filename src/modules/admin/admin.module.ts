import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminViewController } from "./admin-view.controller";
import { AdminService } from "./admin.service";
import { GameService } from "../game/game.service";
import { AuthModule } from "../auth/auth.module";
import { FileModule } from "../../common/file/file.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Defence } from "../game/entities/defence.entity";
import { Attack } from "../game/entities/attack.entity";
import { DtlCd } from "../code/entities/dtl-cd.entity";

import { Member } from "../auth/entities/member.entity";
import { MemberLog } from "../auth/entities/member-log.entity";
import { RolesGuard } from "../auth/guards/roles.guard";

@Module({
  imports: [
    AuthModule,
    FileModule,
    TypeOrmModule.forFeature([Defence, Attack, DtlCd, Member, MemberLog]),
  ],
  controllers: [AdminController, AdminViewController],
  providers: [AdminService, GameService, RolesGuard],
})
export class AdminModule {}
