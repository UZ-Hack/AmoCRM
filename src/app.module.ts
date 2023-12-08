import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CrmModule } from './crm/crm.module';
import { TokenService } from './token/token.service';

@Module({
  imports: [CrmModule],
  controllers: [AppController],
  providers: [AppService, TokenService],
})
export class AppModule {}
