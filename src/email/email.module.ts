import { Module } from '@nestjs/common';
import { EmailService } from './email.services';
import { MicrosoftToken } from './email.token.services';

@Module({
  providers: [MicrosoftToken, EmailService],
  exports: [EmailService],
})
export class EmailModule {}
