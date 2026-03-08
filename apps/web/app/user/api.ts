import type { CreateUser, UpdateUser, User } from '@repo/schemas';
import { aiEngineApi } from '../../utils/driver/api';

/**
 * User API
 */
export const userApi = {
  /**
   * Get all users
   */
  getUserList: async (): Promise<User[]> => {
    const response = await aiEngineApi.get<User[]>('/user');
    return response.data;
  },

  /**
   * Get user by id
   */
  getUser: async (id: string): Promise<User> => {
    const response = await aiEngineApi.get<User>(`/user/${id}`);
    return response.data;
  },

  /**
   * Create user
   */
  createUser: async (user: CreateUser): Promise<User> => {
    const response = await aiEngineApi.post<User>('/user', user);
    return response.data;
  },

  /**
   * Update user
   */
  updateUser: async (user: UpdateUser): Promise<User> => {
    const response = await aiEngineApi.put<User>('/user', user);
    return response.data;
  },
};
