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
    return new Promise<UserResponse>((resolve) => {
      setTimeout(() => {
        resolve(user);
      }, 1000);
    });
  }

  async getUserList(): Promise<User[]> {
    return new Promise<User[]>((resolve) => {
      setTimeout(() => {
        resolve(this.userList);
      }, 1000);
    });
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

    return new Promise<UserResponse>((resolve) => {
      setTimeout(() => {
        resolve(updatedUser);
      }, 1000);
    });
  }

  async getUser(id: string): Promise<UserResponse> {
    const user = this.userList.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const foundUser: UserResponse = user;
    return new Promise<UserResponse>((resolve) => {
      setTimeout(() => {
        resolve(foundUser);
      }, 1000);
    });
  }
}
