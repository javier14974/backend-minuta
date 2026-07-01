import { Module } from '@nestjs/common';
import { FathomController } from './fathom.controller';
import { FathomService } from './fathom.services';
import { Traduccion_IA_Services } from 'src/IA/Traduccion_IA.services';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [FathomController],
  providers: [FathomService, Traduccion_IA_Services],
  exports: [FathomService],
})
export class FathomModule {}
