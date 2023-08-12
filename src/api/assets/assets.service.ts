import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AssetsRepository } from './assets.repository';
import { CreateAssetDto } from './dto/create-asset.dto';
import { Asset } from './entities/asset.entity';

@Injectable()
export class AssetsService {
  constructor(
    private readonly assetsRepository: AssetsRepository,
    private readonly dataSource: DataSource,
  ) {}

  async createAsset(createAssetDto: CreateAssetDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      const { identifier, ...rest } = createAssetDto;

      const findAsset = await this.assetsRepository.findAssets(
        identifier,
        queryRunner,
      );
      const lastAssetnumber: number =
        findAsset[findAsset.length - 1]?.assetnumber;

      findAsset.length === 0
        ? (createAssetDto.assetnumber = 1)
        : (createAssetDto.assetnumber = lastAssetnumber + 1);
      const createAsset = await this.assetsRepository.createAsset(
        createAssetDto,
        queryRunner,
      );
      const dashInput = {
        name: rest.name,
        category: rest.category,
        note: '자산이 등록되었습니다.',
        identifier,
      };
      const createDashboard = await this.assetsRepository.createDashboard(
        dashInput,
        queryRunner,
      );
      await queryRunner.commitTransaction();
      return createAsset;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.log(err.stack || err.message);
      throw err;
    } finally {
      queryRunner.release();
    }
  }

  excelCreateAsset = async (createExcel): Promise<any> => {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      const findAsset = await this.assetsRepository.findAssets(
        createExcel.assets[0].identifier,
        queryRunner,
      );
      let assetnumber = 0;
      findAsset.length === 0
        ? (assetnumber = 1)
        : (assetnumber = findAsset[findAsset.length - 1].assetnumber + 1);
      const createAssetInput: CreateAssetDto[] = createExcel.assets.map(
        (v: CreateAssetDto) => {
          v.assetnumber = assetnumber++;
          return v;
        },
      );
      const createDashboardInput = createExcel.assets.map(
        (v: CreateAssetDto) => {
          const { name, category, identifier } = v;
          const dashInput = {
            name,
            category,
            note: '자산이 등록되었습니다.',
            identifier,
          };
          return dashInput;
        },
      );

      const createAsset = await this.assetsRepository.createAsset(
        createAssetInput,
        queryRunner,
      );
      const createDashboard = await this.assetsRepository.createDashboard(
        createDashboardInput,
        queryRunner,
      );
      await queryRunner.commitTransaction();
      return createAsset;
    } catch (err: any) {
      console.error(err.stack || err.message);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      queryRunner.release();
    }
  };

  async updateAsset(assets): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      const { assetnumber, identifier, ...rest } = assets;
      const findAsset =
        await this.assetsRepository.findAssetFromIdAndAssetNumber(
          identifier,
          assetnumber,
          queryRunner,
        );

      const updateAsset = await this.assetsRepository.updateAsset(
        assetnumber,
        identifier,
        rest,
        queryRunner,
      );

      const dashInput = {
        name: findAsset.name,
        category: findAsset.category,
        note: '',
        identifier: findAsset.identifier,
      };

      if (rest.location && rest.status)
        dashInput.note = '자산위치 및 상태가 변경되었습니다.';
      else if (rest.location) dashInput.note = '자산위치가 변경되었습니다.';
      else if (rest.status) dashInput.note = '자산상태가 변경되었습니다.';

      if (rest.location || rest.status)
        await this.assetsRepository.createDashboard(dashInput, queryRunner); // 트랜잭션을 관리하는 queryRunner를 넘겨줍니다.
      await queryRunner.commitTransaction();
      return '성공';
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      console.error(err.stack || err.message);
      throw err;
    } finally {
      await queryRunner.release(); // queryRunner를 해제합니다.
    }
  }

  async removeAssets(removeDto: any): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      const records = await this.assetsRepository.findRemoveInstance(
        removeDto,
        queryRunner,
      );
      if (!records) throw new Error('해당하는 자산이 없습니다.');
      const dashInput = records.map((record) => {
        return {
          name: record.name,
          category: record.category.id,
          note: '자산이 삭제되었습니다.',
          identifier: record.identifier.id,
        };
      });
      const removeAsset = await this.assetsRepository.removeAssets(
        records,
        queryRunner,
      );
      if (!removeAsset) throw new Error('삭제에 실패하였습니다.');
      await this.assetsRepository.createDashboard(dashInput, queryRunner);
      await queryRunner.commitTransaction();
      return '성공';
    } catch (err: any) {
      console.error(err.stack || err.mes);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  readAsset = async (val: any): Promise<any> => {
    try {
      const { page, identifier } = val;
      const findAsset = await this.assetsRepository.offsetAssets(
        identifier,
        page,
      );

      if (!findAsset) {
        throw new Error('자산이 존재하지않습니다.');
      }

      const result = findAsset.reduce(
        (acc: Asset[], cur: Asset, index: number) => {
          if (findAsset.length % 10 !== 0) {
            if (index >= findAsset.length - (findAsset.length % 10)) {
              acc.push(cur);
            }
          } else if (index >= findAsset.length - 10) {
            acc.push(cur);
          }
          return acc;
        },
        [],
      );
      const totalCount = await this.assetsRepository.countAssets(identifier);

      const categoryCounts = await this.assetsRepository.countAssetsByCategory(
        identifier,
      );
      const countByCategory = categoryCounts.reduce(
        (acc: any, countObj: any) => {
          acc[countObj['id']] = parseInt(countObj['count']);
          return acc;
        },
        {},
      );
      const Count = {
        totalCount,
        ldsTotalCount: countByCategory[1] || 0,
        monitorTotalCount: countByCategory[2] || 0,
        mobileTotalCount: countByCategory[3] || 0,
        officeequipmentTotalCount: countByCategory[4] || 0,
        otherequipmentTotalCount: countByCategory[5] || 0,
        softwareTotalCount: countByCategory[6] || 0,
      };

      return {
        Assets: result,
        ...Count,
      };
    } catch (err: any) {
      console.error(err.stack || err.message);

      throw err;
    }
  };

  categoryReadAsset = async (val: any): Promise<any> => {
    try {
      const { page, identifier, category, value } = val;
      const findAsset = await this.assetsRepository.findCategory(
        page,
        identifier,
        category,
        value,
      );

      const result = findAsset.result.reduce(
        (acc: Asset[], cur: Asset, index: number) => {
          if (findAsset.result.length % 10 !== 0) {
            if (
              index >=
              findAsset.result.length - (findAsset.result.length % 10)
            ) {
              acc.push(cur);
            }
          } else if (index >= findAsset.result.length - 10) {
            acc.push(cur);
          }
          return acc;
        },
        [],
      );
      return { Assets: result, totalCount: findAsset.count };
    } catch (err: any) {
      console.error(err.stack || err.message);

      throw err;
    }
  };

  async dashboardReadAsset(val: any): Promise<any> {
    try {
      const { page, identifier } = val;
      const findAsset = await this.assetsRepository.findDashboard(
        identifier,
        page,
      );

      const result = findAsset.reduce((acc: any[], cur: any, index: number) => {
        if (findAsset.length % 10 !== 0) {
          if (index >= findAsset.length - (findAsset.length % 10)) {
            acc.push(cur);
          }
        } else if (index >= findAsset.length - 10) {
          acc.push(cur);
        }
        return acc;
      }, []);

      const totalCount = await this.assetsRepository.dashBoardCount(identifier);

      return { Assets: result, totalCount };
    } catch (err: any) {
      console.error(err.stack || err.message);

      throw err;
    }
  }
}
