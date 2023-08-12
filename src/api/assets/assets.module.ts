import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { Asset } from './entities/asset.entity';
import { Dashboard } from './entities/dashboard.entity';
import { AssetsRepository } from './assets.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { User } from '../users/entities/user.entity';
import { Category } from './entities/category.entity';
import { Status } from './entities/status.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Asset,
      Dashboard,
      Company,
      User,
      Category,
      Status,
    ]),
  ],
  controllers: [AssetsController],
  providers: [AssetsService, AssetsRepository],
})
export class AssetsModule {}
