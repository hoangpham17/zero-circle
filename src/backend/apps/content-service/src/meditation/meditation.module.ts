import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { MeditationController } from './meditation.controller';
import { MeditationService } from './meditation.service';

@Module({
  imports: [DatabaseModule],
  controllers: [MeditationController],
  providers: [MeditationService],
  exports: [MeditationService],
})
export class MeditationModule {}