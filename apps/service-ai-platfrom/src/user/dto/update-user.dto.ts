import { createZodDto } from 'nestjs-zod';
import { UpdateUserSchema } from '@repo/schemas';

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
