import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { AdministradoresEntry } from './entry/administradores.entry';
import { SequelizeModule } from '@nestjs/sequelize';

const jwtExpiresIn = (process.env.JWT_EXPIRES_IN || '8h') as StringValue;

@Module({
  imports: [
    SequelizeModule.forFeature([AdministradoresEntry]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: jwtExpiresIn },
    }),
  ],
  exports: [JwtModule],
})
export class AuthModule {}