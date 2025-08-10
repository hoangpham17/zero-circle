import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { BuddhistContentController } from './buddhist-content.controller';
import { BuddhistContentService } from './buddhist-content.service';

@Module({
  imports: [DatabaseModule],
  controllers: [BuddhistContentController],
  providers: [BuddhistContentService],
  exports: [BuddhistContentService],
})
export class BuddhistContentModule {}