import { Module } from '@nestjs/common';
import { UsersModule } from './api/users/users.module';
import { AssetsModule } from './api/assets/assets.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DB } from './api/config/postgrepsql.config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot(DB),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UsersModule,
    AssetsModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
