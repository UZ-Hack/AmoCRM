import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class CRMService {
  constructor(
    private readonly httpService: HttpService,
    private readonly tokenService: TokenService,
  ) {}

  private readonly amoCRMBaseUrl = 'https://msuvonovhack.amocrm.ru';
  private readonly oauthUrl =
    'https://msuvonovhack.amocrm.ru/oauth2/access_token';

  async exchangeCodeForTokens(
    clientId: string,
    clientSecret: string,
    code: string,
    redirectUri: string,
  ) {
    const data = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    };

    try {
      const response = await axios.post(this.oauthUrl, data);

      if (response.status >= 200 && response.status < 300) {
        return response.data;
      } else {
        throw new Error(`Invalid response status: ${response.status}`);
      }
    } catch (error) {
      throw new Error(
        `Error exchanging authorization code for tokens: ${error.message}`,
      );
    }
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${
        this.tokenService.getAccessToken().access_token
      }`,
    };
  }

  async searchContact(
    name: string,
    email: string,
    phone: string,
  ): Promise<any> {
    try {
      const emailResponse: AxiosResponse = await this.httpService
        .get(`${this.amoCRMBaseUrl}/contacts?query=${email}`, {
          headers: this.getHeaders(),
        })
        .toPromise();

      if (emailResponse.data._embedded.contacts.length > 0) {
        return emailResponse.data._embedded.contacts[0];
      }

      const phoneResponse: AxiosResponse = await this.httpService
        .get(`${this.amoCRMBaseUrl}/contacts?query=${phone}`, {
          headers: this.getHeaders(),
        })
        .toPromise();

      if (phoneResponse.data._embedded.contacts.length > 0) {
        return phoneResponse.data._embedded.contacts[0];
      }

      throw new NotFoundException('Contact not found');
    } catch (error) {
      throw new NotFoundException('Contact not found');
    }
  }

  async createOrUpdateContact(
    name: string,
    email: string,
    phone: string,
  ): Promise<any> {
    const existingContact = await this.searchContact('', email, phone);

    if (existingContact) {
      const response: AxiosResponse = await this.httpService
        .patch(
          `/contacts/${existingContact.id}`,
          { name, email, phone },
          { headers: this.getHeaders() },
        )
        .toPromise();

      return response.data;
    } else {
      const response: AxiosResponse = await this.httpService
        .post(
          '/contacts',
          { name, email, phone },
          { headers: this.getHeaders() },
        )
        .toPromise();

      return response.data;
    }
  }

  async createDeal(
    contactId: number,
    dealName: string,
    statusId: number,
  ): Promise<any> {
    const response: AxiosResponse = await this.httpService
      .post(
        '/leads',
        { name: dealName, contacts_id: [contactId], status_id: statusId },
        { headers: this.getHeaders() },
      )
      .toPromise();

    return response.data;
  }

  async createOrUpdateContactAndDeal(
    name: string,
    email: string,
    phone: string,
    dealName: string,
    statusId: number,
  ): Promise<any> {
    const contact = await this.createOrUpdateContact(name, email, phone);
    const deal = await this.createDeal(contact.id, dealName, statusId);

    return { contact, deal };
  }
}
