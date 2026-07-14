import { Controller, Get } from "@nestjs/common";
import { SeccionesServices } from "./secciones.services";

@Controller('secciones')
export class SeccionesController {
  constructor(private readonly seccionesServices: SeccionesServices) {}

  @Get('obtener_secciones')
  async obtener_secciones() {
    return this.seccionesServices.obtener_secciones();
  }
}