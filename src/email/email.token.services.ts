import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class MicrosoftToken {
  private readonly logger = new Logger(MicrosoftToken.name);

  private static cache: { accessToken: string; expiresAt: number } | null = null;

  async getAccessToken(): Promise<string> {
    if (
      MicrosoftToken.cache &&
      Date.now() < MicrosoftToken.cache.expiresAt - 60_000
    ) {
      return MicrosoftToken.cache.accessToken;
    }
    return this.refresh();
  }

  private async refresh(): Promise<string> {
    this.logger.log(
      "Fetching Microsoft OAuth2 access token (client credentials)...",
    );

    let data: { access_token: string; expires_in: number };
    try {
      const response = await axios.post(
        `https://login.microsoftonline.com/${process.env.SMTP_TENANT_ID}/oauth2/v2.0/token`,
        new URLSearchParams({
          grant_type: "client_credentials",
          client_id: process.env.SMTP_CLIENT_ID || "",
          client_secret: process.env.SMTP_CLIENT_SECRET || "",
          scope: "https://graph.microsoft.com/.default",
        }),
      );
      data = response.data;
    } catch (error) {
      const detail =
        axios.isAxiosError(error) && error.response?.data
          ? error.response.data
          : error instanceof Error
            ? error.message
            : error;
      this.logger.error(
        "Failed to fetch Microsoft OAuth2 token:",
        JSON.stringify(detail),
      );
      throw error;
    }

    MicrosoftToken.cache = {
      accessToken: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };

    const expiresIn = Math.round(data.expires_in / 60);
    this.logger.log(
      `Microsoft OAuth2 token obtained — expires in ${expiresIn} min`,
    );
    return MicrosoftToken.cache.accessToken;
  }
}
