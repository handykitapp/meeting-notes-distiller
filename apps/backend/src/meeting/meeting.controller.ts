import { Body, Controller, Post, Res, UploadedFiles, UseInterceptors, BadRequestException } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { MeetingService, UploadedMeetingFile } from "./meeting.service";
import { WordExportService } from "./word-export.service";
import { MeetingExtractionResult } from "@mnd/extractor";

@Controller("meetings")
export class MeetingController {
  constructor(
    private readonly meetingService: MeetingService,
    private readonly wordExportService: WordExportService
  ) {}

  @Post("process")
  @UseInterceptors(FilesInterceptor("files"))
  process(@UploadedFiles() files: UploadedMeetingFile[]) {
    if (!files?.length) throw new BadRequestException("At least one .txt file is required.");
    for (const file of files) {
      if (!file.originalname.toLowerCase().endsWith(".txt")) {
        throw new BadRequestException("Only .txt files are supported.");
      }
    }
    return this.meetingService.processFiles(files);
  }

  @Post("export")
  async export(@Body("meetings") meetings: MeetingExtractionResult[], @Res() res: Response) {
    const buffer = await this.wordExportService.createReport(meetings ?? []);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", "attachment; filename=meeting-notes-distiller-result.docx");
    res.send(buffer);
  }
}
