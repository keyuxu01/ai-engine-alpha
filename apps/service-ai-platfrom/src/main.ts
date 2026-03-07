import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';

import { HttpExceptionFilter } from './filter/zod-validation-exception.filter';
import { ZodValidationExceptionFilter } from './filter/http-exception.filter';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 注册全局异常过滤器（格式化错误响应）
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new ZodValidationExceptionFilter(),
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
  const document = cleanupOpenApiDoc(rawDocument) as OpenAPIObject;
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 8080);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
