import { Module } from '@nestjs/common';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';
import { TokenService } from 'src/token/token.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [CrmController],
  providers: [CrmService, TokenService],
})
export class CrmModule {}
