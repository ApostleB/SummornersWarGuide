import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminViewController } from './admin-view.controller';
import { AdminService } from './admin.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AdminController, AdminViewController],
  providers: [AdminService],
})
export class AdminModule {}
