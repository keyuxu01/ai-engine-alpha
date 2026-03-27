import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';

import {
  ZodValidationExceptionFilter,
  HttpExceptionFilter,
} from './common/filter';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 注册全局异常过滤器（格式化错误响应）
  // 注意：后注册的先执行，所以更具体的异常过滤器要后注册
  app.useGlobalFilters(
    new HttpExceptionFilter(), // 通用 - 先注册
    new ZodValidationExceptionFilter(), // 具体 - 后注册
  );

  // Enable CORS
  app.enableCors();

  // Enable Swagger
  const config = new DocumentBuilder()
    .setTitle('Service AI Platform')
    .setDescription('Service AI Platform API')
    .setVersion('1.0')
    .build();

  const rawDocument = SwaggerModule.createDocument(app, config);
  const document = cleanupOpenApiDoc(rawDocument);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 9001);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
