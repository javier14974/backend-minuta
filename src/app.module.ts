import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FathomModule } from './peticiones_fathom/fathom.module';
import { Traduccion_IA_Module } from './IA/traduccion_IA.module';
import { EmailModule } from './email/email.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronServices } from './cron.services';

@Module({
  imports: [FathomModule, Traduccion_IA_Module, EmailModule, ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, CronServices],
})
export class AppModule {}


