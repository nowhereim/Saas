import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetsService } from './assets.service';
import { CreateAssetDto, createExcelDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { Category } from './entities/category.entity';
import { Company } from './entities/company.entity';
import { Status } from './entities/status.entity';

@Controller('asset')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  async create(@Body() createAssetDto: CreateAssetDto) {
    const result = await this.assetsService.createAsset(createAssetDto);
    return result;
  }

  @Post('/excel')
  async excelCreate(@Body() createAssetDto: createExcelDto) {
    const result = await this.assetsService.excelCreateAsset(createAssetDto);
    return result;
  }

  @Get(':identifier/:page')
  async readAsset(@Param() params) {
    params.page = Number(params.page);
    params.identifier = Number(params.identifier);
    return this.assetsService.readAsset(params);
  }

  @Get('/category/:identifier/:page/:category/:value')
  async readCategory(@Param() params) {
    params.page = Number(params.page);
    params.identifier = Number(params.identifier);
    return this.assetsService.categoryReadAsset(params);
  }

  @Get('/dashboard/:identifier/:page')
  findOne(@Param() params) {
    params.page = Number(params.page);
    params.identifier = Number(params.identifier);

    return this.assetsService.dashboardReadAsset(params);
  }

  @Patch()
  update(@Body() updateAssetDto: UpdateAssetDto) {
    return this.assetsService.updateAsset(updateAssetDto);
  }

  @Delete()
  remove(@Body() removeDto: any) {
    return this.assetsService.removeAssets(removeDto);
  }
}
