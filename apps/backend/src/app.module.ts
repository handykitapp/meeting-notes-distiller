import { Module } from "@nestjs/common";
import { MeetingModule } from "./meeting/meeting.module";
import { HealthController } from "./health/health.controller";

@Module({
  imports: [MeetingModule],
  controllers: [HealthController]
})
export class AppModule {}
