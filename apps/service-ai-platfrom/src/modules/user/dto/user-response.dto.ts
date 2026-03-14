import { createZodDto } from 'nestjs-zod';
import { UserResponseSchema } from '@repo/schemas';

export class UserResponseDto extends createZodDto(UserResponseSchema) {}
