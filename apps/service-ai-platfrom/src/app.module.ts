import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';

import { ExampleModule } from './example/example.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [ExampleModule, UserModule],
  controllers: [],
  providers: [
    {
      // Use ZodValidationPipe for all requests
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      // Use ZodSerializerInterceptor for all responses
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
  ],
})
export class AppModule {}
