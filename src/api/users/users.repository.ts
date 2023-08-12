import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../assets/entities/company.entity';
import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async createUser(createUserDto) {
    return await this.userRepository.save(createUserDto);
  }

  async createCompany(identifier: number) {
    return await this.companyRepository.save({ admin: identifier });
  }

  async updateUserIdentifier(identifier: number, companyid: number) {
    return await this.userRepository.update(identifier, {
      identifier: companyid,
    });
  }

  async findById(userid: number) {
    return await this.userRepository.findBy({ id: userid });
  }

  async resetPassword(email: string, password: string) {
    return await this.userRepository.update(email, { password: password });
  }

  async updateEmail(email: string, newemail: string) {
    return await this.userRepository.update(email, { email: newemail });
  }

  async updateUser(email: string, rest: any) {
    return await this.userRepository.update(email, rest);
  }

  async findByEmail(email) {
    return await this.userRepository.findOne({ where: { email } });
  }

  async deleteUser(email: string) {
    return await this.userRepository.delete(email);
  }

  async existEmail(email: string) {
    return await this.userRepository.exist({ where: { email } });
  }
}
