import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  createUser = async (createUserDto: CreateUserDto) => {
    try {
      const { email, password, name, agreepi, companyname } = createUserDto;

      const pass = await bcrypt.hash(password, 10);
      const createUser = await this.usersRepository.createUser({
        email,
        password: pass,
        name,
        agreepi,
        companyname,
      });

      const createCompany = await this.usersRepository.createCompany(
        createUser.id,
      );
      //TODO: 트랜잭션으로 묶어주세용

      const updateUserIdentifier =
        await this.usersRepository.updateUserIdentifier(
          createUser.id,
          createCompany.id,
        );
      return '회원가입 성공';
    } catch (error: any) {
      console.error(error.stack || error.message);

      throw error;
    }
  };

  readUser = async (userid: number) => {
    try {
      const findUser = await this.usersRepository.findById(userid);
      return findUser;
    } catch (error: any) {
      console.error(error.stack || error.message);
      throw error;
    }
  };

  resetPassword = async (email: string, password: string) => {
    const salt = await bcrypt.genSalt(10);
    try {
      const hashPass = await bcrypt.hash(password, salt);
      const resetPass = await this.usersRepository.resetPassword(
        email,
        hashPass,
      );
      return '비밀번호가 초기화되었습니다.';
    } catch (error: any) {
      console.error(error.stack || error.message);
      throw error;
    }
  };

  updateEmail = async (email: string, newemail: string) => {
    try {
      const updateEmail = await this.usersRepository.updateEmail(
        email,
        newemail,
      );
      return '이메일이 변경되었습니다.';
    } catch (error: any) {
      console.error(error.stack || error.message);
      throw error;
    }
  };

  updateUser = async (email: string, rest: object) => {
    try {
      const updateUser = await this.usersRepository.updateUser(email, rest);
      return '유저 정보가 변경되었습니다.';
    } catch (error: any) {
      console.error(error.stack || error.message);

      throw error;
    }
  };

  deleteUser = async (email: string, password: string) => {
    try {
      const findUser = await this.usersRepository.findByEmail(email);
      const checkPassword = await bcrypt.compare(password, findUser.password);
      if (!checkPassword) throw new Error('비밀번호가 틀렸습니다.');
      const deleteUser = await this.usersRepository.deleteUser(email);
      return true;
    } catch (error: any) {
      console.error(error.stack || error.message);

      throw error;
    }
  };

  checkMail = async (email: string) => {
    try {
      const existEmail = await this.usersRepository.existEmail(email);
      if (existEmail) throw new Error('이미 존재하는 이메일입니다.');
      return true;
    } catch (error: any) {
      console.error(error.stack || error.message);
      throw error;
    }
  };

  checkPassword = async (email: string, password: string) => {
    try {
      const findUser = await this.usersRepository.findByEmail(email);
      const check = await bcrypt.compare(password, findUser.password);
      if (!check) throw new Error('비밀번호가 일치하지 않습니다.');
      return true;
    } catch (error: any) {
      console.error(error.stack || error.message);
      throw error;
    }
  };
}
