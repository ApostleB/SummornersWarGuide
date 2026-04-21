import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  Get,
  Delete,
  Param,
  Put,
  Body,
  Req,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "path";
import * as fs from "fs";
import { Request } from "express";
import { AuthUser } from "../../common/middlewares/auth.middleware";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { AdminService } from "./admin.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { MinLevel } from "../auth/decorators/min-level.decorator";
import { FileService } from "../../common/file/file.service";

const multerOptions = {
  storage: memoryStorage(),
};

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/admin")
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly fileService: FileService,
  ) {}

  @MinLevel("99")
  @Post("upload")
  @UseInterceptors(FileInterceptor("file", multerOptions))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("File is required");
    }
    const data = await this.fileService.readExcel(file);
    return { success: true, data };
  }

  // ========== 메인 관리 ==========

  @MinLevel("99")
  @Get("main")
  async getMainContent() {
    const data = await this.adminService.getMainContent();
    return { success: true, data };
  }

  @MinLevel("99")
  @Post("main")
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: "image1", maxCount: 1 }, { name: "image2", maxCount: 1 }, { name: "image3", maxCount: 1 }],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            const uploadDir = join(process.cwd(), process.env.UPLOAD_IMAGE || "public/image/main");
            fs.mkdirSync(uploadDir, { recursive: true });
            cb(null, uploadDir);
          },
          filename: (req, file, cb) => {
            cb(null, `${file.fieldname}_${Date.now()}${extname(file.originalname)}`);
          },
        }),
      },
    ),
  )
  async updateMainContent(
    @Body() body: any,
    @UploadedFiles() files: { image1?: Express.Multer.File[]; image2?: Express.Multer.File[]; image3?: Express.Multer.File[] },
  ) {
    const current = await this.adminService.getMainContent();
    const uploadDir = process.env.UPLOAD_IMAGE || "public/image/main";

    const resolveAttr = (
      attrKey: "codeAttr1" | "codeAttr2" | "codeAttr3",
      fileKey: "image1" | "image2" | "image3",
      deleteFlag: string,
    ): string | null | undefined => {
      const uploadedFile = files?.[fileKey]?.[0];
      const existing = current?.[attrKey];

      if (deleteFlag === "true") {
        if (existing) {
          const filePath = join(process.cwd(), uploadDir, existing);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        return null;
      }

      if (uploadedFile) {
        if (existing) {
          const oldPath = join(process.cwd(), uploadDir, existing);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        return uploadedFile.filename;
      }

      return undefined; // 변경 없음
    };

    const updateData: any = {};
    if (body.codeValue !== undefined) updateData.codeValue = body.codeValue;

    const attr1 = resolveAttr("codeAttr1", "image1", body.deleteImage1);
    const attr2 = resolveAttr("codeAttr2", "image2", body.deleteImage2);
    const attr3 = resolveAttr("codeAttr3", "image3", body.deleteImage3);

    if (attr1 !== undefined) updateData.codeAttr1 = attr1;
    if (attr2 !== undefined) updateData.codeAttr2 = attr2;
    if (attr3 !== undefined) updateData.codeAttr3 = attr3;

    await this.adminService.updateMainContent(updateData);
    return { success: true };
  }

  // ========== 코드 관리 (level 99) ==========

  @Get("board/list/:boardType")
  async getBoardList(@Param("boardType") boardType: string) {
    const getBoardList = await this.adminService.getBoardList(boardType);
    return { success: true, getBoardList };
  }

  @Post("board")
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: "boardImages", maxCount: 5 }],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            const uploadDir = join(process.cwd(), "public/image/board");
            fs.mkdirSync(uploadDir, { recursive: true });
            cb(null, uploadDir);
          },
          filename: (req, file, cb) => {
            cb(null, `board_${Date.now()}_${Math.random().toString(36).slice(2)}${extname(file.originalname)}`);
          },
        }),
      },
    ),
  )
  async createBoard(
    @Body() data: any,
    @UploadedFiles() files: { boardImages?: Express.Multer.File[] },
    @Req() req: Request,
  ) {
    const user = req.user as AuthUser;
    const board = await this.adminService.createBoard({ ...data, inputId: user.memberId });

    const uploadedFiles = files?.boardImages || [];
    if (uploadedFiles.length > 5) {
      throw new BadRequestException("이미지는 최대 5개까지 업로드할 수 있습니다.");
    }
    for (let i = 0; i < uploadedFiles.length; i++) {
      await this.adminService.createBoardFile({
        boardId: board.boardId,
        filePath: uploadedFiles[i].filename,
        fileExt: extname(uploadedFiles[i].originalname).replace(".", ""),
        fileOrd: i,
        inputId: user.memberId,
      });
    }

    return { success: true, board };
  }

  @Put("board/:boardId")
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: "boardImages", maxCount: 5 }],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            const uploadDir = join(process.cwd(), "public/image/board");
            fs.mkdirSync(uploadDir, { recursive: true });
            cb(null, uploadDir);
          },
          filename: (req, file, cb) => {
            cb(null, `board_${Date.now()}_${Math.random().toString(36).slice(2)}${extname(file.originalname)}`);
          },
        }),
      },
    ),
  )
  async updateBoard(
    @Param("boardId") boardId: string,
    @Body() data: any,
    @UploadedFiles() files: { boardImages?: Express.Multer.File[] },
    @Req() req: Request,
  ) {
    const user = req.user as AuthUser;
    const { deleteFileIds, ...boardData } = data;

    await this.adminService.updateBoard(boardId, boardData);

    // 개별 파일 삭제 처리
    if (deleteFileIds) {
      const ids: string[] = Array.isArray(deleteFileIds) ? deleteFileIds : [deleteFileIds];
      for (const fileId of ids) {
        const boardFiles = await this.adminService.getBoardFiles(boardId);
        const target = boardFiles.find((f) => f.fileId === fileId);
        if (target) {
          const filePath = join(process.cwd(), "public/image/board", target.filePath);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          await this.adminService.softDeleteBoardFile(fileId);
        }
      }
    }

    // 새 파일 추가
    const uploadedFiles = files?.boardImages || [];
    const existingFiles = await this.adminService.getBoardFiles(boardId);
    if (existingFiles.length + uploadedFiles.length > 5) {
      throw new BadRequestException("이미지는 최대 5개까지 업로드할 수 있습니다.");
    }
    const nextOrd = existingFiles.length;
    for (let i = 0; i < uploadedFiles.length; i++) {
      await this.adminService.createBoardFile({
        boardId,
        filePath: uploadedFiles[i].filename,
        fileExt: extname(uploadedFiles[i].originalname).replace(".", ""),
        fileOrd: nextOrd + i,
        inputId: user.memberId,
      });
    }

    return { success: true };
  }

  @Delete("board/:boardId")
  async deleteBoard(@Param("boardId") boardId: string) {
    // 연결된 파일들 soft delete + 물리 파일 삭제
    const boardFiles = await this.adminService.getBoardFiles(boardId);
    for (const file of boardFiles) {
      const filePath = join(process.cwd(), "public/image/board", file.filePath);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await this.adminService.softDeleteBoardFilesByBoardId(boardId);
    await this.adminService.deleteBoard(boardId);
    return { success: true };
  }

  @MinLevel("99")
  @Get("codes/grp")
  async getGrpCdList() {
    const grpCdList = await this.adminService.getGrpCdList();
    return { success: true, grpCdList };
  }

  @Get("codes/dtl/:grpCd")
  async getDtlCdList(@Param("grpCd") grpCd: string) {
    const dtlCdList = await this.adminService.getDtlCdList(grpCd);
    return { success: true, dtlCdList };
  }

  @MinLevel("99")
  @Post("codes/dtl")
  async createDtlCd(@Body() data: any) {
    const dtlCd = await this.adminService.createDtlCd(data);
    return { success: true, dtlCd };
  }

  @MinLevel("99")
  @Put("codes/dtl/:idx")
  async updateDtlCd(@Param("idx") idx: number, @Body() data: any) {
    await this.adminService.updateDtlCd(idx, data);
    return { success: true };
  }

  @MinLevel("99")
  @Delete("codes/dtl/:idx")
  async deleteDtlCd(@Param("idx") idx: number) {
    await this.adminService.deleteDtlCd(idx);
    return { success: true };
  }
}
