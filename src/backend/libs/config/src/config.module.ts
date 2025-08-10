import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        // Database
        DATABASE_URL: Joi.string().required(),
        
        // JWT
        JWT_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.string().default('1h'),
        JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),
        
        // API
        API_PORT: Joi.number().default(3000),
        API_PREFIX: Joi.string().default('api'),
        
        // Services
        AUTH_SERVICE_PORT: Joi.number().default(3001),
        CONTENT_SERVICE_PORT: Joi.number().default(3002),
        USER_SERVICE_PORT: Joi.number().default(3003),
        
        // Redis
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
        
        // Environment
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
      }),
      envFilePath: ['.env'],
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}