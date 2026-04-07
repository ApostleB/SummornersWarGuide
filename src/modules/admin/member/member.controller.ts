import {
  Controller,
  Get,
  UseGuards,
  Param,
  Put,
  Body,
  Delete,
} from "@nestjs/common";
import { AdminMemberService } from "./member.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { MinLevel } from "../../auth/decorators/min-level.decorator";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/admin")
export class AdminMemberController {
  constructor(private readonly adminMemberService: AdminMemberService) {}

  @Get("members/pending")
  async getPendingMembers() {
    const members = await this.adminMemberService.getPendingMembers();
    return { success: true, members };
  }

  @Put("members/:memberId/status")
  async updateMemberStatus(
    @Param("memberId") memberId: string,
    @Body("status") status: any,
  ) {
    await this.adminMemberService.updateMemberStatus(memberId, status);
    return { success: true };
  }

  @Get("members")
  async getAllMembers() {
    const members = await this.adminMemberService.getAllMembers();
    return { success: true, members };
  }

  @Put("members/:memberId/password-reset")
  async resetPassword(@Param("memberId") memberId: string) {
    await this.adminMemberService.resetMemberPassword(memberId);
    return { success: true };
  }

  @MinLevel("99")
  @Delete("members/:memberId")
  async kickMember(@Param("memberId") memberId: string) {
    await this.adminMemberService.kickMember(memberId);
    return { success: true };
  }

  @Get("members/:memberId/logs")
  async getMemberLogs(@Param("memberId") memberId: string) {
    const logs = await this.adminMemberService.getMemberLogs(memberId);
    return { success: true, logs };
  }

  @Get("codes/member-level")
  async getMemberLevelCodes() {
    const codes = await this.adminMemberService.getMemberLevelCodes();
    return { success: true, codes };
  }

  @MinLevel("99")
  @Put("members/:memberId/level")
  async updateMemberLevel(
    @Param("memberId") memberId: string,
    @Body("code") code: string,
  ) {
    await this.adminMemberService.updateMemberLevel(memberId, code);
    return { success: true };
  }
}
