import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { KeysController } from './keys.controller';
import { KeysServices } from './keys.services';
import { KeysEntry } from './entry/keys.entry';
import { SeccionesEntry } from 'src/secciones/entry/secciones.entry';

@Module({
  imports: [SequelizeModule.forFeature([KeysEntry, SeccionesEntry])],
  controllers: [KeysController],
  providers: [KeysServices],
  exports: [KeysServices],
})
export class KeysModule {}
