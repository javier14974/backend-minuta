import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { UsuariosServices } from "./usuarios.services";
import { CrearUsuarioDto } from "./dto/crear-usuario.dto";


@Controller('usuarios')
export class UsuariosController {
    constructor(private readonly usuariosServices: UsuariosServices) {}

    @Get('obtener_usuarios')
    async getUsuarios() {
        return this.usuariosServices.getUsuarios();
    }

    @Post('crear_usuario')
    async crearUsuario(@Body() body: CrearUsuarioDto) {
        return this.usuariosServices.crearUsuario(body);
    }

    @Delete('eliminar_usuario/:id')
    async eliminarUsuario(@Param('id') id: string) {
        return this.usuariosServices.eliminarUsuario(id);
    }
}