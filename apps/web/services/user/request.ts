import { User } from '@repo/schemas';
import { aiEngineApi } from '../../utils';

const createUser = async (user: User) => {
  const response = await aiEngineApi.post('/user', user);
  return response.data;
};

const getUserList = async () => {
  const response = await aiEngineApi.get('/user');
  return response.data;
};

export { createUser, getUserList };
