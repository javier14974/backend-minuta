import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { KeysEntry } from "./entry/keys.entry";
import { KeysDto } from "./dto/keys.dto";
import Cryptr from 'cryptr';
import { SeccionesEntry } from "src/secciones/entry/secciones.entry";

@Injectable()
export class KeysServices {
  constructor(
    @InjectModel(KeysEntry)
    private readonly keysRepository: typeof KeysEntry,
  ) {}

  private obtenerCryptr() {
    const secreto = process.env.JWT_SECRET?.trim();
    if (!secreto) {
      throw new Error('JWT_SECRET no está configurada en el servidor');
    }
    return new Cryptr(secreto);
  }

  async create(keysDto: KeysDto) {
    const keyCifrada = this.cifrado(keysDto.nombre);
    const keyCreada = await this.keysRepository.create({
      nombre: keyCifrada,
      seccion_id: keysDto.seccion_id,
    } as any);

    return {
      id: keyCreada.id,
      seccion_id: keyCreada.seccion_id,
      webhook_url: `/fathom/despertar_backend/${keyCreada.id}`,
    };
  }

  async obtenerKeys() {
    const keys = await this.keysRepository.findAll({
      include: [SeccionesEntry],
      order: [['id', 'DESC']],
    });

    const keysFormateadas: {
      id: number;
      seccion_id: number;
      seccion_nombre: string;
      webhook_url: string;
    }[] = [];

    for (const keyRegistro of keys) {
      keysFormateadas.push({
        id: keyRegistro.id,
        seccion_id: keyRegistro.seccion_id,
        seccion_nombre: keyRegistro.seccion?.nombre ?? String(keyRegistro.seccion_id),
        webhook_url: `/fathom/despertar_backend/${keyRegistro.id}`,
      });
    }

    return keysFormateadas;
  }

  async eliminarKey(id: number) {
    const key = await this.keysRepository.findByPk(id);
    if (!key) {
      return { eliminada: false, mensaje: 'Key no encontrada' };
    }
    await key.destroy();
    return { eliminada: true, mensaje: 'Key eliminada correctamente' };
  }

  async obtenerPorId(keyId: number) {
    const key = await this.keysRepository.findByPk(keyId, {
      include: [SeccionesEntry],
    });
    return key;
  }

  async obtenerPorKeyPlana(keyPlana: string) {
    const keys = await this.keysRepository.findAll({
      include: [SeccionesEntry],
    });

    for (const keyRegistro of keys) {
      try {
        const keyDescifrada = this.descifrado(keyRegistro.nombre);
        if (keyDescifrada === keyPlana) {
          return keyRegistro;
        }
      } catch {
        continue;
      }
    }

    return null;
  }

  cifrado(key: string) {
    return this.obtenerCryptr().encrypt(key);
  }

  descifrado(keyCifrada: string) {
    return this.obtenerCryptr().decrypt(keyCifrada);
  }
}
