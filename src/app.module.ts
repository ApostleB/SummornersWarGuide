import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { TodoModule } from "./modules/todo/todo.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CodeModule } from "./modules/code/code.module";
import { DatabaseModule } from "./common/database/database.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    DatabaseModule,
    TodoModule,
    AuthModule,
    CodeModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
