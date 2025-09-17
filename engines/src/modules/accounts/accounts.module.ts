import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { Account } from './entities/account.entity';
import { User } from '../users/entities/user.entity';
import { Media } from '../media/entities/media.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, User, Media]),
  ],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
