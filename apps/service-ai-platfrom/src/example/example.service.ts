import { Injectable } from '@nestjs/common';
import type { CreateExampleRequest, Example } from '@repo/types';

@Injectable()
export class ExampleService {
  private readonly examples: Example[] = [];

  async createExample(createExampleRequest: CreateExampleRequest) {
    const example: Example = {
      ...createExampleRequest,
      id: Math.random().toString(36).substring(2, 15),
    };
    this.examples.push(example);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(example);
      }, 1000);
    });
  }

  async getExample() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.examples);
      }, 1000);
    });
  }
}
