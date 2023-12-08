import {
  Controller,
  Get,
  Query,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CRMService } from './crm.service';
import { TokenService } from 'src/token/token.service';

@Controller('crm')
export class CrmController {
  private logger = new Logger(CrmController.name);

  constructor(
    private readonly crmService: CRMService,
    private readonly tokenService: TokenService,
  ) {}

  @Get()
  async exchangeCodeForTokens(
    @Query('client_id') clientId: string,
    @Query('client_secret') clientSecret: string,
    @Query('code') code: string,
    @Query('redirect_uri') redirectUri: string,
  ) {
    try {
      const tokens = await this.crmService.exchangeCodeForTokens(
        clientId,
        clientSecret,
        code,
        redirectUri,
      );

      this.tokenService.setAccessToken(tokens);

      this.logger.log('Access tokens obtained successfully.');

      return this.tokenService.getAccessToken();
    } catch (error) {
      this.logger.error(
        `Error during code exchange for tokens: ${error.message}`,
      );
      throw new HttpException(
        'Ошибка при обмене кода авторизации на токены',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('contact')
  async contact(
    @Query('name') name: string,
    @Query('email') email: string,
    @Query('phone') phone: string,
  ) {
    return this.crmService.searchContact(name, email, phone);
  }
}
