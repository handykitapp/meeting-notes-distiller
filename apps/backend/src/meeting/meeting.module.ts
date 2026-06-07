import { Module } from "@nestjs/common";
import { MeetingController } from "./meeting.controller";
import { MeetingService } from "./meeting.service";
import { WordExportService } from "./word-export.service";

@Module({
  controllers: [MeetingController],
  providers: [MeetingService, WordExportService]
})
export class MeetingModule {}
