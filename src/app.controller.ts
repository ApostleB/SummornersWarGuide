import { Controller, Get, Render, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async main(@Req() req: Request, @Res() res: Response) {
    const renderPage = req.user ? "index" : "auth/login";

    const content = await this.appService.getMainContent();

    return res.render(renderPage, {
      title: "서머너즈 워 가이드",
      user: req.user || null,
      content,
    });
  }
}
