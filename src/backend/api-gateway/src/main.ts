import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS setup
  app.enableCors();

  // API prefix
  const apiPrefix = configService.get<string>('API_PREFIX') || 'api';
  app.setGlobalPrefix(apiPrefix);

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('ZeroCircle API')
    .setDescription('The ZeroCircle API Gateway')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  // Start HTTP server
  const port = configService.get<number>('API_PORT') || 3000;
  await app.listen(port);
  
  console.log(`API Gateway is running on: ${await app.getUrl()}`);
}

bootstrap();
