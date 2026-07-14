import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AdministradoresEntry } from "./entry/administradores.entry";
import { InjectModel } from "@nestjs/sequelize";
import { LoginDto } from "./dto/login.dto";
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AdministradoresServices {
    
    constructor(
        @InjectModel(AdministradoresEntry)
        private readonly administradoresRepository: typeof AdministradoresEntry,
        private readonly jwtService: JwtService,
    ) {}


    async login(body: LoginDto) {
        const administrador = await this.administradoresRepository.findOne({
          where: { email: body.email.trim() },
        });
        if (!administrador) {
          throw new UnauthorizedException('Credenciales inválidas');
        }

        const contraseñaValida = await this.validar_contraseña(
          body.contraseña,
          administrador,
        );
        if (!contraseñaValida) {
          throw new UnauthorizedException('Credenciales inválidas');
        }

        const payload = {
          sub: administrador.id,
          email: administrador.email,
          seccion: administrador.seccion,
        };
        const token = await this.jwtService.signAsync(payload);
        return {
          token,
          administrador: {
            id: administrador.id,
            nombre: administrador.nombre,
            email: administrador.email,
            seccion: administrador.seccion,
          },
        };
      }

    private async validar_contraseña(
      contraseña: string,
      administrador: AdministradoresEntry,
    ): Promise<boolean> {
      const contraseñaGuardada = administrador.getDataValue('contraseña');

      if (!contraseñaGuardada) {
        return false;
      }

      const esHashBcrypt = contraseñaGuardada.startsWith('$2');

      if (esHashBcrypt) {
        return bcrypt.compare(contraseña, contraseñaGuardada);
      }

      if (contraseñaGuardada !== contraseña) {
        return false;
      }

      const contraseñaHasheada = await bcrypt.hash(contraseña, 12);
      await administrador.update({ contraseña: contraseñaHasheada });
      return true;
    }
}