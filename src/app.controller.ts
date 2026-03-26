import { Controller, Get, Render, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";

@Controller()
export class AppController {
  @Get()
  main(@Req() req: Request, @Res() res: Response) {
    const renderPage = req.user ? "index" : "auth/login";

    return res.render(renderPage, {
      title: "서머너즈 워 가이드",
      user: req.user || null,
    });
  }
}
