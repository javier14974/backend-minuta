import { Controller, Get } from "@nestjs/common";
import { UsuariosServices } from "./usuarios.services";


@Controller('usuarios')
export class UsuariosController {
    constructor(private readonly usuariosServices: UsuariosServices) {}

    @Get('obtener_usuarios')
    async getUsuarios() {
        return this.usuariosServices.getUsuarios();
    }
}