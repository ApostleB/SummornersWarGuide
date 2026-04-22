import { Controller, Get, Render, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async main(@Req() req: Request, @Res() res: Response) {
    if (req.user) {
      const [content, patchNoteList] = await Promise.all([
        this.appService.getMainContent(),
        this.appService.getPatchNoteList(),
      ]);
      return res.render("index", {
        title: "서머너즈 워 가이드",
        user: req.user,
        content: content.text,
        images: content.images,
        patchNoteList,
      });
    }

    const content = await this.appService.getGuestContent();
    return res.render("auth/login", {
      title: "서머너즈 워 가이드",
      user: null,
      content: content.text,
      images: content.images,
    });
  }
}
