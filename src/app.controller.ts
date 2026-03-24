import {Controller, Get, Render, Req, Res} from "@nestjs/common";
import { Request } from "express";

@Controller()
export class AppController {
  @Get()
  @Render("index")
  async main(@Req() req: Request, @Res() res: Response) {
    if (req.user === undefined) {
      console.log(res);
    }
    return { title: "서머너즈 워 가이드", user: req.user || null };
  }
}
