import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';

import { UserService } from './user.service';
import { UserResponseDto } from './dto/user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ZodResponse({
    type: UserResponseDto,
  })
  @ApiOperation({ summary: 'Create a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully created.',
    type: UserResponseDto,
  })
  async createUser(
    @Body() createUser: CreateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.createUser(createUser);
  }

  @Get()
  @ZodResponse({
    type: [UserResponseDto],
  })
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'The users have been successfully retrieved.',
    type: [UserResponseDto],
  })
  async getUserList(): Promise<UserResponseDto[]> {
    return this.userService.getUserList();
  }

  @Put()
  @ZodResponse({
    type: UserResponseDto,
  })
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
    type: UserResponseDto,
  })
  async updateUser(
    @Body() updateUser: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.updateUser(updateUser);
  }

  @Get(':id')
  @ZodResponse({
    type: UserResponseDto,
  })
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully retrieved.',
    type: UserResponseDto,
  })
  async getUser(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.getUser(id);
  }
}
