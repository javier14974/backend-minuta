import { Controller, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { FathomService } from './fathom.services';

@Controller('fathom')
export class FathomController {
  constructor(private readonly fathomService: FathomService) {}

  @Get('enviar_minutos_reunion')
  enviarMinutosReunion(@Query('key') key: string) {
    return this.fathomService.getVisits(key);
  }

  // Acepta id numérico o la API key de Fathom:
  // POST /fathom/despertar_backend/1
  // POST /fathom/despertar_backend/MdSx0bN8JyiZ_YtZ5ZaGCQ....
  @Post('despertar_backend/:key')
  @HttpCode(200)
  despertarBackend(@Param('key') key: string) {
    this.fathomService.procesarMinutaEnBackground(key);
    return {
      ok: true,
      message: 'Backend despertado, procesando minuta en segundo plano',
    };
  }
}
