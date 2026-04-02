import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminViewController } from "./admin-view.controller";
import { AdminService } from "./admin.service";
import { AuthModule } from "../auth/auth.module";
import { FileModule } from "../../common/file/file.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Defence } from "../game/entities/defence.entity";
import { Attack } from "../game/entities/attack.entity";
import {DtlCd} from "../code/entities/dtl-cd.entity";

@Module({
  imports: [
    AuthModule,
    FileModule,
    TypeOrmModule.forFeature([Defence, Attack, DtlCd]),
  ],
  controllers: [AdminController, AdminViewController],
  providers: [AdminService],
})
export class AdminModule {}
