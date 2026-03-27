import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUser, UpdateUser, User, UserResponse } from '@repo/schemas';

@Injectable()
export class UserService {
  private readonly userList: User[] = [];

  async createUser(createUser: CreateUser): Promise<UserResponse> {
    const user: User = {
      id: Math.random().toString(36).substring(2, 15),
      role: createUser.role,
      name: createUser.name,
      age: createUser.age,
      email: createUser.email,
      createdAt: new Date().toISOString(),
      detailInfo: createUser.detailInfo,
    };

    this.userList.push(user);
    return user;
  }

  async getUserList(): Promise<User[]> {
    return this.userList;
  }

  async updateUser(updateUser: UpdateUser): Promise<UserResponse> {
    const userIndex = this.userList.findIndex((u) => u.id === updateUser.id);
    if (userIndex === -1) {
      throw new NotFoundException('User not found');
    }
    const user = this.userList[userIndex];
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const updatedUser: User = {
      ...user,
      ...updateUser,
      id: user.id,
    };

    this.userList[userIndex] = updatedUser;
    return updatedUser;
  }

  async getUser(id: string): Promise<UserResponse> {
    const user = this.userList.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
