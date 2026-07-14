import { InjectModel } from "@nestjs/sequelize";
import { SeccionesEntry } from "./entry/secciones.entry";
import { Injectable } from "@nestjs/common";



@Injectable()
export class SeccionesServices {
  constructor(
    @InjectModel(SeccionesEntry)
    private readonly seccionesRepository: typeof SeccionesEntry,
  ) {}

  async obtener_secciones() {
    return this.seccionesRepository.findAll({
      attributes: ['id', 'nombre'],
    });
  }
}