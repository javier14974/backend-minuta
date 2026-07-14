import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { FathomController } from './fathom.controller';
import { FathomService } from './fathom.services';
import { Traduccion_IA_Services } from 'src/IA/Traduccion_IA.services';
import { EmailModule } from 'src/email/email.module';
import { KeysModule } from 'src/keys/keys.module';
import { RolesEntry } from 'src/roles/roles.entry';
import { UsuariosEntry } from 'src/usuarios/entry/usuarios.entry';

@Module({
  imports: [
    EmailModule,
    KeysModule,
    SequelizeModule.forFeature([UsuariosEntry, RolesEntry]),
  ],
  controllers: [FathomController],
  providers: [FathomService, Traduccion_IA_Services],
  exports: [FathomService],
})
export class FathomModule {}
