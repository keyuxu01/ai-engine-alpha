import { Body, Controller, Get, Post } from '@nestjs/common';
import type { CreateExampleRequest } from '@repo/types';
import { ExampleService } from './example.service';

@Controller('example')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Post()
  async createExample(@Body() createExampleRequest: CreateExampleRequest) {
    return this.exampleService.createExample(createExampleRequest);
  }

  @Get()
  async getExample() {
    return this.exampleService.getExample();
  }
}
