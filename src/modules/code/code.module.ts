import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GrpCd } from "./entities/grp-cd.entity";
import { DtlCd } from "./entities/dtl-cd.entity";

@Module({
  imports: [TypeOrmModule.forFeature([GrpCd, DtlCd])],
  exports: [TypeOrmModule],
})
export class CodeModule {}
