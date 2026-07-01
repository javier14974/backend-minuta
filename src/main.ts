import { webcrypto } from 'node:crypto';
import { config } from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as Crypto;
}

config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const puerto = Number(process.env.PORT) || 3011;
  await app.listen(puerto);
  console.log(`Backend escuchando en http://localhost:${puerto}`);
}
bootstrap();
