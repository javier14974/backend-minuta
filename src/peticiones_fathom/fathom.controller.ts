import {
  Body,
    Controller,
    Get,
    Post,
  } from '@nestjs/common';
import { FathomService } from './fathom.services';

  
  @Controller('fathom')
  export class FathomController {
    constructor(private readonly fathomService: FathomService) {}

    @Get('enviar_minutos_reunion')
    enviarMinutosReunion() {
        return this.fathomService.getVisits();
    }

    @Post('despertar_backend') /* acepta lo q sea */
    despertarBackend() {
        return this.fathomService.getVisits();
    }
  }