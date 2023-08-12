import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  //TODO: DTO설정
  @Post()
  async signUp(@Body() createUserDto: CreateUserDto) {
    try {
      const result = await this.userService.createUser(createUserDto);
      return result;
    } catch (error: any) {
      console.error(error.stack || error.message);
      return error;
    }
  }

  @Post()
  async updateUser(@Body() body: any) {
    try {
      const { email, ...rest } = body;
      const user = await this.userService.updateUser(email, rest);
      return user;
    } catch (error: any) {
      console.error(error.stack || error.message);
      return error;
    }
  }
  @Post()
  async updateEmail(@Body() body: any) {
    try {
      const { email, newemail } = body;
      const user = await this.userService.updateEmail(email, newemail);
      return user;
    } catch (error: any) {
      console.error(error.stack || error.message);
      return error;
    }
  }
  @Delete()
  async deleteUser(@Body() body: any) {
    try {
      const { email, password } = body;
      const user = await this.userService.deleteUser(email, password);
      return user;
    } catch (error: any) {
      console.error(error.stack || error.message);
      return error;
    }
  }
  @Patch()
  async resetPassword(@Body() body: any) {
    try {
      const { email, password } = body;
      const user: string = await this.userService.resetPassword(
        email,
        password,
      );
      return user;
    } catch (error: any) {
      console.error(error.stack || error.message);
      return error;
    }
  }
  @Get(':id')
  async readUser(@Param() id: number) {
    try {
      const user = await this.userService.readUser(id);
      return user;
    } catch (error: any) {
      console.error(error.stack || error.message);
      return error;
    }
  }
  @Post()
  async checkUser(@Body() body: any) {
    try {
      const { email, password } = body;
      if (!password) {
        const checkMail = await this.userService.checkMail(email);
        return checkMail;
      } else {
        const user = await this.userService.checkPassword(email, password);
        return user;
      }
    } catch (error: any) {
      console.error(error.stack || error.message);
      return error;
    }
  }
}
