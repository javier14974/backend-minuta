import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { KeysServices } from "./keys.services";
import { KeysDto } from "./dto/keys.dto";

@Controller('keys')
export class KeysController {
  constructor(private readonly keysServices: KeysServices) {}

  @Post('crear_key')
  async create(@Body() keysDto: KeysDto) {
    return this.keysServices.create(keysDto);
  }

  @Get('obtener_keys')
  async obtenerKeys() {
    return this.keysServices.obtenerKeys();
  }

  @Delete('eliminar_key/:id')
  async eliminarKey(@Param('id') id: string) {
    return this.keysServices.eliminarKey(Number(id));
  }
}
