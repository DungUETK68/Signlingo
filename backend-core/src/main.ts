import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('SignlingoBootstrap');
  const app = await NestFactory.create(AppModule);

  // Cấu hình CORS cho Frontend React
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Validation toàn cục với class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Thiết lập tài liệu Swagger API
  const config = new DocumentBuilder()
    .setTitle('Signlingo Core Business API')
    .setDescription('Hệ thống API quản lý nghiệp vụ, người dùng, từ điển VSL và tiến trình học tập')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Signlingo Core Backend đang chạy tại: http://localhost:${port}`);
  logger.log(`📖 Tài liệu Swagger API tại: http://localhost:${port}/api/docs`);
}
bootstrap();

