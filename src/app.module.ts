import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./modules/auth/auth.module";
import { CodeModule } from "./modules/code/code.module";
import { GameModule } from "./modules/game/game.module";
import { AdminModule } from "./modules/admin/admin.module";
import { DatabaseModule } from "./common/database/database.module";
import { AuthMiddleware } from "./common/middlewares/auth.middleware";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    JwtModule.register({}),
    DatabaseModule,
    AuthModule,
    CodeModule,
    GameModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes("*");
  }
}
