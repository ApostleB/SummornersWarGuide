import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminViewController } from "./admin-view.controller";
import { AdminService } from "./admin.service";
import { AuthModule } from "../auth/auth.module";
import { FileModule } from "../../common/file/file.module";

@Module({
  imports: [AuthModule, FileModule],
  controllers: [AdminController, AdminViewController],
  providers: [AdminService],
})
export class AdminModule {}
