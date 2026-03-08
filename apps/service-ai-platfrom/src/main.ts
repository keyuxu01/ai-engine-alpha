import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';

import { ZodValidationExceptionFilter } from './filter/zod-validation-exception.filter';
import { HttpExceptionFilter } from './filter/http-exception.filter';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 注册全局异常过滤器（格式化错误响应）
  // 注意：后注册的先执行，所以更具体的异常过滤器要后注册
  app.useGlobalFilters(
    new HttpExceptionFilter(), // 捕获所有 HttpException（通用）
    new ZodValidationExceptionFilter(), // 捕获 ZodValidationException（具体，先执行）
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

  await app.listen(process.env.PORT ?? 8080);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
