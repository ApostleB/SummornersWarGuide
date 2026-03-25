import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthController } from "./auth.controller";
import { AuthViewController } from "./auth-view.controller";
import { MypageController } from "./mypage.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { Member } from "./entities/member.entity";
import { MemberLog } from "./entities/member-log.entity";
import { DtlCd } from "../code/entities/dtl-cd.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Member, MemberLog, DtlCd]),
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: "1h",
        },
      }),
    }),
  ],
  controllers: [AuthController, AuthViewController, MypageController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}
