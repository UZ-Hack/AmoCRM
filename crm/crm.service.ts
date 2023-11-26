import { Injectable } from '@nestjs/common';
import { TokenService } from 'src/token/token.service';
import axios from 'axios';

@Injectable()
export class CrmService {
  private readonly oauthUrl =
    'https://msuvonovhack.amocrm.ru/oauth2/access_token';
  private readonly apiUrl = 'https://msuvonovhack.amocrm.ru/api/v4';

  constructor(private readonly tokenService: TokenService) {}

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
      return response.data;
    } catch (error) {
      throw new Error('Error exchanging authorization code for tokens');
    }
  }

  private async getAuthorizationHeader() {
    const accessToken = this.tokenService.getAccessToken();

    if (!accessToken) {
      throw new Error('Access token is missing');
    }

    return {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  async getAllContacts() {
    try {
      const headers = await this.getAuthorizationHeader();
      const response = await axios.get(`${this.apiUrl}/contacts`, { headers });

      return response.data;
    } catch (error) {
      throw new Error('Error getting all contacts from AmoCRM API');
    }
  }

  async findContact(email: string, phone: string): Promise<any> {
    const contactsEndpoint = `${this.apiUrl}/contacts`;

    const filter = {
      filter: {
        or: [
          { custom_fields_values: { field_id: 'email', values: [email] } },
          { custom_fields_values: { field_id: 'phone', values: [phone] } },
        ],
      },
    };

    try {
      const response = await axios.get(contactsEndpoint, { params: filter });
      return response.data;
    } catch (error) {
      throw new Error('Error finding contact in AmoCRM API');
    }
  }

  async createContact(name: string, email: string, phone: string) {
    try {
      const headers = await this.getAuthorizationHeader();
      const response = await axios.post(
        `${this.apiUrl}/contacts`,
        { name, email, phone },
        { headers },
      );
      return response.data;
    } catch (error) {
      throw new Error('Error creating contact in AmoCRM API');
    }
  }

  async updateContact(contactId: string, data: any) {
    try {
      const headers = await this.getAuthorizationHeader();
      const response = await axios.patch(
        `${this.apiUrl}/contacts/${contactId}`,
        data,
        { headers },
      );
      return response.data;
    } catch (error) {
      throw new Error('Error updating contact in AmoCRM API');
    }
  }

  async createDeal(contactId: string) {
    try {
      const headers = await this.getAuthorizationHeader();
      const response = await axios.post(
        `${this.apiUrl}/leads`,
        { contacts_id: [contactId] },
        { headers },
      );
      return response.data;
    } catch (error) {
      throw new Error('Error creating deal in AmoCRM API');
    }
  }
}
