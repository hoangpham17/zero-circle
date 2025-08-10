import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ContentController } from './content.controller';
import { MeditationController } from './meditation.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'CONTENT_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: 'localhost',
            port: configService.get<number>('CONTENT_SERVICE_PORT') || 3002,
          },
        }),
      },
    ]),
    AuthModule,
  ],
  controllers: [ContentController, MeditationController],
})
export class ContentModule {}