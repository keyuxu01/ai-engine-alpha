import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUser, UpdateUser, User, UserResponse } from '@repo/schemas';

@Injectable()
export class UserService {
  private readonly userList: User[] = [];

  async createUser(createUser: CreateUser): Promise<UserResponse> {
    const user: User = {
      ...createUser,
      id: Math.random().toString(36).substring(2, 15),
      createdAt: new Date().toISOString(),
    };

    this.userList.push(user);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(user);
      }, 1000);
    });
  }

  async getUserList(): Promise<User[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.userList);
      }, 1000);
    });
  }

  async updateUser(updateUser: UpdateUser): Promise<UserResponse> {
    const user = this.userList.find((user) => user.id === updateUser.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const updatedUser: User = {
      ...user,
      ...updateUser,
    };

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(updatedUser);
      }, 1000);
    });
  }

  async getUser(id: string): Promise<UserResponse> {
    const user = this.userList.find((user) => user.id === id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(user);
      }, 1000);
    });
  }
}
