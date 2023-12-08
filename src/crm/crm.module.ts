import { Module } from '@nestjs/common';
import { CrmController } from './crm.controller';
import { CRMService } from './crm.service';
import { TokenService } from 'src/token/token.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [CrmController],
  providers: [CRMService, TokenService],
})
export class CrmModule {}
