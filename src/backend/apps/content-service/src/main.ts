import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ContentModule } from './content.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(ContentModule);
  const configService = app.get(ConfigService);
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Microservice setup
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: configService.get<number>('CONTENT_SERVICE_PORT'),
    },
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Content Service API')
    .setDescription('The content service API for meditation and Buddhist teachings')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Start microservice and HTTP server
  await app.startAllMicroservices();
  await app.listen(configService.get<number>('CONTENT_SERVICE_PORT'));
  
  console.log(`Content service is running on: ${await app.getUrl()}`);
}

bootstrap();