import {
  Controller,
  Get,
  Query,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CrmService } from './crm.service';
import { TokenService } from 'src/token/token.service';

@Controller('crm')
export class CrmController {
  private logger = new Logger(CrmController.name);

  constructor(
    private readonly amoAuthService: CrmService,
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
      const tokens = await this.amoAuthService.exchangeCodeForTokens(
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

  @Get('all-contacts')
  async getAllContacts() {
    try {
      const contacts = await this.amoAuthService.getAllContacts();

      return { success: true, contacts };
    } catch (error) {
      this.logger.error('Error getting all contacts', error);
      throw new HttpException(
        'Ошибка при получении всех контактов',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('process-contact')
  async processContact(
    @Query('name') name: string,
    @Query('email') email: string,
    @Query('phone') phone: string,
  ) {
    try {
      const existingContact = await this.amoAuthService.findContact(
        email,
        phone,
      );

      if (existingContact) {
        await this.amoAuthService.updateContact(existingContact.id, {
          name,
          email,
          phone,
        });
      } else {
        const newContact = await this.amoAuthService.createContact(
          name,
          email,
          phone,
        );
        await this.amoAuthService.createDeal(newContact.id);
      }

      return { success: true, message: 'Данные контакта успешно обработаны' };
    } catch (error) {
      this.logger.error('Error during contact processing', error);
      throw new HttpException(
        'Ошибка при обработке данных контакта',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
