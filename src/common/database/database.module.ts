import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
        type: "mariadb",
        host: configService.get<string>("DB_HOST"),
        port: configService.get<number>("DB_PORT"),
        username: configService.get<string>("DB_USERNAME"),
        password: configService.get<string>("DB_PASSWORD"),
        database: configService.get<string>("DB_DATABASE"),
        autoLoadEntities: true,
        synchronize: false,
        extra: {
          connectionLimit: 80,
          waitForConnections: true,
          queueLimit: 0,
          connectTimeout: 10000,
          idleTimeout: 60000,
        },
        logging: ["warn", "error"],
        maxQueryExecutionTime: 1000,
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
