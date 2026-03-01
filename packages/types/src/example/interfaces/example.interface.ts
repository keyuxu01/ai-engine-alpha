import type { CreateExampleRequest } from '../dto/example.request';

export interface Example extends CreateExampleRequest {
  id: string;
}
