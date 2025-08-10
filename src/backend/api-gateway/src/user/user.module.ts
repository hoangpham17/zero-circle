import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserController } from './user.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'USER_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: 'localhost',
            port: configService.get<number>('USER_SERVICE_PORT') || 3003,
          },
        }),
      },
    ]),
    AuthModule,
  ],
  controllers: [UserController],
})
export class UserModule {}