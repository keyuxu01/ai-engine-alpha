import { z } from 'zod';

/**
 * User role schema
 */
const UserRoleSchema = z.enum(['admin', 'user']);

/**
 * User schema
 */
const UserSchema = z
  .object({
    id: z.string(),
    role: UserRoleSchema,
    name: z
      .string()
      .min(1, 'Name is required')
      .max(100, 'Name must be less than 100 characters'),
    age: z.int().min(1, 'Age is required').max(100, 'Age must be less than 100'),
    email: z.email('Invalid email address'),
    createdAt: z.iso.datetime(),
  })
  .meta({
    id: 'user-entity',
    name: 'User',
    description: 'User schema',
    createdAt: z.date(),
    updatedAt: z.date(),
  });

/**
 * Create user schema
 */
const CreateUserSchema = UserSchema.omit({ id: true, createdAt: true }).meta({
  id: 'create-user-entity',
  name: 'Create User',
  description: 'Create user schema',
});
/**
 * Update user schema
 */
const UpdateUserSchema = UserSchema.partial().meta({
  id: 'update-user-entity',
  name: 'Update User',
  description: 'Update user schema',
});

/**
 * Delete user schema
 */
const DeleteUserSchema = UserSchema.pick({ id: true }).meta({
  id: 'delete-user-entity',
  name: 'Delete User',
  description: 'Delete user schema',
});

const UserResponseSchema = UserSchema.meta({
  id: 'user-response',
  name: 'User Response',
  description: 'User response schema',
});

/**
 * User type
 */
type User = z.infer<typeof UserSchema>;

/**
 * User role type
 */
type UserRole = z.infer<typeof UserRoleSchema>;

/**
 * Create user type
 */
type CreateUser = z.infer<typeof CreateUserSchema>;

/**
 * Update user type
 */
type UpdateUser = z.infer<typeof UpdateUserSchema>;

/**
 * Delete user type
 */
type DeleteUser = z.infer<typeof DeleteUserSchema>;

/**
 * User response type
 */
type UserResponse = z.infer<typeof UserResponseSchema>;

export {
  UserSchema,
  UserRoleSchema,
  User,
  UserRole,
  CreateUserSchema,
  UpdateUserSchema,
  DeleteUserSchema,
  CreateUser,
  UpdateUser,
  DeleteUser,
  UserResponseSchema,
  UserResponse,
};
