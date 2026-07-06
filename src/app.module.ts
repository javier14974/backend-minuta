import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FathomModule } from './peticiones_fathom/fathom.module';
import { Traduccion_IA_Module } from './IA/traduccion_IA.module';
import { EmailModule } from './email/email.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RolesModule } from './roles/roles.module';
import { RolesEntry } from './roles/roles.entry';
import { UsuariosEntry } from './usuarios/entry/usuarios.entry';
import { UsuarioRolesEntry } from './usuarios/entry/usuario-roles.entry';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AdministradoresModule } from './administradores/administradores.module';
/* import { CronServices } from './cron.services'; */

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      models: [RolesEntry, UsuariosEntry, UsuarioRolesEntry],
      autoLoadModels: true,
      synchronize: false, // false en producción, true en desarrollo
      logging: false,
    }),
    FathomModule,
    Traduccion_IA_Module,
    EmailModule,
    ScheduleModule.forRoot(),
    RolesModule,
    UsuariosModule,
    AdministradoresModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}



