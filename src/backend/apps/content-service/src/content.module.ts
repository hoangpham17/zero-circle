import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@app/database';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { MeditationModule } from './meditation/meditation.module';
import { BuddhistContentModule } from './buddhist-content/buddhist-content.module';
import { ResourceModule } from './resource/resource.module';
import { MeditationConfigModule } from './meditation-config/meditation-config.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    MeditationModule,
    BuddhistContentModule,
    ResourceModule,
    MeditationConfigModule,
  ],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}