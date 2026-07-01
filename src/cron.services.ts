import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FathomService } from './peticiones_fathom/fathom.services';

/* @Injectable()
export class CronServices {
  private readonly logger = new Logger(CronServices.name);

  constructor(private readonly fathomService: FathomService) {}

  // Todos los días a las 12:39:00 — formato: segundos minutos horas día mes día-semana
  @Cron('0 41 12 * * *', { name: 'envio-minuta-diaria' })
  async manejarEnvioAutomatico() {
    this.logger.log('Cron activado: enviando minuta automáticamente...');

    try {
      await this.fathomService.getVisits();
      this.logger.log('Minuta enviada correctamente.');
    } catch (error) {
      this.logger.error('Error al enviar la minuta automática', error);
    }
  }
} */


  /* mas adelante poder resumir la reus para dar uan informacion mas precisa de que hizo cada programador en toda la semana */