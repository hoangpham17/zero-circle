import { Module } from '@nestjs/common';
import { MeditationConfigController } from './meditation-config.controller';
import { MeditationConfigService } from './meditation-config.service';
import { PrismaModule } from '@app/database';

@Module({
  imports: [PrismaModule],
  controllers: [MeditationConfigController],
  providers: [MeditationConfigService],
  exports: [MeditationConfigService],
})
export class MeditationConfigModule {}