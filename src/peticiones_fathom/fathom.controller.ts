import { Controller, Get, HttpCode, Post } from '@nestjs/common';
import { FathomService } from './fathom.services';

@Controller('fathom')
export class FathomController {
  constructor(private readonly fathomService: FathomService) {}

  @Get('enviar_minutos_reunion')
  enviarMinutosReunion() {
    return this.fathomService.getVisits();
  }

  @Post('despertar_backend')
  @HttpCode(200)
  despertarBackend() {
    this.fathomService.procesarMinutaEnBackground();
    return { ok: true, message: 'Backend despertado, procesando minuta en segundo plano' };
  }
}