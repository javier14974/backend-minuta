import { config } from 'dotenv';
config();

import { webcrypto } from 'node:crypto';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as Crypto;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const puerto = Number(process.env.PORT) || 3011;
  await app.listen(puerto);
  console.log(`Backend escuchando en http://localhost:${puerto}`);
}
bootstrap();
