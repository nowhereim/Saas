import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, QueryRunner, Repository } from 'typeorm';
import { Asset } from './entities/asset.entity';
import { Dashboard } from './entities/dashboard.entity';
import { createRest } from './interface/AssetInterfaces';

@Injectable()
export class AssetsRepository {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(Dashboard)
    private readonly dashboardRepository: Repository<Dashboard>,
  ) {}

  async findAssets(
    identifier: number,
    queryRunner?: QueryRunner,
  ): Promise<any> {
    try {
      identifier = Number(identifier);
      const assetRepo = await queryRunner.manager.getRepository(Asset);

      const selectFields = [
        ['asset.id', 'id'],
        ['asset.assetnumber', 'assetnumber'],
        ['asset.name', 'name'],
        ['category.category', 'category'],
        ['asset.identifier', 'identifier'],
        ['asset.note', 'note'],
        ['asset.acquisitionDate', 'acquisitionDate'],
        ['asset.manufacturer', 'manufacturer'],
        ['asset.location', 'location'],
        ['status.status', 'status'],
        ['asset.serialnumber', 'serialnumber'],
      ];
      const queryBuilder = assetRepo.createQueryBuilder('asset');

      selectFields.forEach(([field, alias]) => {
        queryBuilder.addSelect(field, alias);
      });

      const list = await queryBuilder
        .innerJoin('asset.identifier', 'identifier')
        .innerJoin('asset.status', 'status')
        .innerJoin('asset.category', 'category')
        .where('asset.identifier = :identifier', { identifier })

        .orderBy('asset.assetnumber', 'ASC')
        .getRawMany();

      return list;
    } catch (err: any) {
      console.error(err.stack || err.mes);
      throw err;
    }
  }

  async offsetAssets(identifier: number, page = 1): Promise<any> {
    try {
      identifier = Number(identifier);
      const selectFields = [
        ['asset.id', 'id'],
        ['asset.assetnumber', 'assetnumber'],
        ['asset.name', 'name'],
        ['category.category', 'category'],
        ['asset.identifier', 'identifier'],
        ['asset.note', 'note'],
        ['asset.acquisitionDate', 'acquisitionDate'],
        ['asset.manufacturer', 'manufacturer'],
        ['asset.location', 'location'],
        ['status.status', 'status'],
        ['asset.serialnumber', 'serialnumber'],
      ];
      const queryBuilder = this.assetRepository.createQueryBuilder('asset');

      selectFields.forEach(([field, alias]) => {
        queryBuilder.addSelect(field, alias);
      });

      const list = await queryBuilder
        .innerJoin('asset.identifier', 'identifier')
        .innerJoin('asset.status', 'status')
        .innerJoin('asset.category', 'category')
        .where('asset.identifier = :identifier', { identifier })
        .orderBy('asset.assetnumber', 'ASC')
        .limit(10 * page)
        .getRawMany();

      return list;
    } catch (err: any) {
      console.error(err.stack || err.mes);
      throw err;
    }
  }

  async findRemoveInstance(
    conditions: { assetnumber: number; identifier: number }[],
    queryRunner: QueryRunner,
  ): Promise<any> {
    try {
      const assetRepo = await queryRunner.manager.getRepository(Asset);
      const removeInstance = assetRepo
        .createQueryBuilder('asset')
        .innerJoinAndSelect('asset.identifier', 'identifier')
        .innerJoinAndSelect('asset.category', 'category');
      conditions.forEach((condition, index) => {
        const assetNumberParam = `assetnumber${index}`;
        const identifierParam = `identifier${index}`;
        if (index === 0) {
          removeInstance.where(
            `asset.assetnumber = :${assetNumberParam} AND asset.identifier = :${identifierParam}`,
            {
              [assetNumberParam]: condition.assetnumber,
              [identifierParam]: condition.identifier,
            },
          );
        } else {
          removeInstance.orWhere(
            `asset.assetnumber = :${assetNumberParam} AND asset.identifier = :${identifierParam}`,
            {
              [assetNumberParam]: condition.assetnumber,
              [identifierParam]: condition.identifier,
            },
          );
        }
      });
      return removeInstance.getMany();
    } catch (err: any) {
      console.error(err.stack || err.mes);
      throw err;
    }
  }

  async findAssetFromIdAndAssetNumber(
    identifier: number,
    assetnumber: number,
    queryRunner: QueryRunner,
  ): Promise<Asset> {
    try {
      const assetRepo = queryRunner.manager.getRepository(Asset);
      const list = await assetRepo.findOne({
        where: { identifier, assetnumber },
      });

      return list;
    } catch (err: any) {
      console.error(err.stack || err.message);
      throw err;
    }
  }

  async updateAsset(
    assetnumber: number,
    identifier: number,
    rest: createRest,
    queryRunner: QueryRunner,
  ): Promise<any> {
    try {
      const assetRepo = queryRunner.manager.getRepository(Asset);
      const updateResult = await assetRepo.update(
        { identifier, assetnumber },
        { ...rest },
      );

      return updateResult;
    } catch (err: any) {
      console.error(err.stack || err.message);
      throw err;
    }
  }

  async createDashboard(
    value: any,
    queryRunner?: QueryRunner,
  ): Promise<InsertResult> {
    try {
      const dashboardRepo = queryRunner.manager.getRepository(Dashboard);
      const result = await dashboardRepo.insert(value);
      return result;
    } catch (err: any) {
      console.error(err.stack || err.message);
      throw err;
    }
  }

  async createAsset(
    createAssetDto,
    queryRunner?: QueryRunner,
  ): Promise<InsertResult> {
    try {
      const assetRepo = queryRunner.manager.getRepository(Asset);

      const result = await assetRepo.insert(createAssetDto);

      return result;
    } catch (err: any) {
      console.error(err.stack || err.message);
      throw err;
    }
  }

  async removeAssets(records, queryRunner: QueryRunner): Promise<any> {
    try {
      const assetRepo = queryRunner.manager.getRepository(Asset);
      const removeAssets = await assetRepo.remove(records);

      return removeAssets;
    } catch (err: any) {
      console.error(err.stack || err.mes);
      throw err;
    }
  }

  async countAssets(identifier: number): Promise<number> {
    try {
      const result = await this.assetRepository
        .createQueryBuilder('asset')
        .where('asset.identifier = :identifier', { identifier })
        .getCount();
      return result;
    } catch (err: any) {
      console.error(err.stack || err.mes);
      throw err;
    }
  }

  async countAssetsByCategory(identifier: number): Promise<any[]> {
    try {
      const counts = await this.assetRepository
        .createQueryBuilder('asset')
        .select('category.id', 'id')
        .addSelect('COUNT(asset.id)', 'count')
        .innerJoin('asset.category', 'category')
        .where('asset.identifier = :identifier', { identifier })
        .groupBy('category.id')
        .getRawMany();
      return counts;
    } catch (err: any) {
      console.error(err.stack || err.mes);
      throw err;
    }
  }

  async findCategory(page, identifier, category, value) {
    try {
      const result = await this.assetRepository
        .createQueryBuilder('asset')
        .select('asset.id', 'id')
        .addSelect('asset.name', 'name')
        .addSelect('asset.serialNumber', 'serialNumber')
        .innerJoin('asset.category', 'category')
        .addSelect('category.category', 'category_category')
        .innerJoin('asset.status', 'status')
        .addSelect('status.status', 'status_status')
        .limit(10 * page)
        .where('asset.identifier = :identifier', { identifier });

      switch (category) {
        case 'status':
          result.andWhere('asset.status = :value', { value: Number(value) });
          break;
        case 'category':
          result.andWhere('asset.category = :value', {
            value: Number(value),
          });
          break;
        case 'product':
          result.andWhere('asset.product = :value', { value: Number(value) });
          break;
        case 'name':
          result.andWhere('asset.name = :value', { value });
          break;
        case 'serialNumber':
          result.andWhere('asset.serialNumber = :value', { value });
          break;
        case 'location':
          result.andWhere('asset.location = :value', { value });
          break;
        default:
          throw new Error(`${category} 는 잘못된 카테고리입니다.`);
      }
      return {
        result: await result.getRawMany(),
        count: await result.getCount(),
      };
    } catch (err: any) {
      console.error(err.stack || err.mes);
      throw err;
    }
  }

  async findDashboard(identifier: number, page?: any): Promise<any> {
    try {
      const test = await this.dashboardRepository
        .createQueryBuilder('dashboard')
        .where('dashboard.identifier = :identifier', { identifier })
        .orderBy('dashboard.id', 'DESC')
        .limit(10 * page)
        .getMany();
      return test;
    } catch (err: any) {
      console.error(err.stack || err.mes);
      throw err;
    }
  }

  async dashBoardCount(identifier: number): Promise<any> {
    try {
      const result = await this.dashboardRepository
        .createQueryBuilder('dashboard')
        .select('dashboard.id', 'id')
        .where('dashboard.identifier = :identifier', { identifier })
        .getCount();
      return result;
    } catch (err: any) {
      console.error(err.stack || err.mes);
      throw err;
    }
  }
}
