import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenService {
  private tokenType: string;
  private expiresIn: number;
  private accessToken: string;
  private refreshToken: string;

  setAccessToken(tokens: {
    token_type: string;
    expires_in: number;
    access_token: string;
    refresh_token: string;
  }) {
    this.tokenType = tokens.token_type;
    this.expiresIn = tokens.expires_in;
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
  }

  getAccessToken() {
    return {
      token_type: this.tokenType,
      expires_in: this.expiresIn,
      access_token: this.accessToken,
      refresh_token: this.refreshToken,
    };
  }
}
