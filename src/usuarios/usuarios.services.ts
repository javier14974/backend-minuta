import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { CreationAttributes } from "sequelize";
import { RolesEntry } from "src/roles/roles.entry";
import { CrearUsuarioDto } from "./dto/crear-usuario.dto";
import { UsuarioRolesEntry } from "./entry/usuario-roles.entry";
import { UsuariosEntry } from "./entry/usuarios.entry";

@Injectable()
export class UsuariosServices {
  constructor(
    @InjectModel(UsuariosEntry)
    private readonly usuariosRepository: typeof UsuariosEntry,

    @InjectModel(RolesEntry)
    private readonly rolesRepository: typeof RolesEntry,

    @InjectModel(UsuarioRolesEntry)
    private readonly usuarioRolesRepository: typeof UsuarioRolesEntry,
  ) {}

  async getUsuarios() {
    return this.usuariosRepository.findAll({
      include: [RolesEntry],
    });
  }

  async crearUsuario(body: CrearUsuarioDto) {
    const usuario = await this.usuariosRepository.create({
      nombre: body.nombre,
      email: body.email,
      seccion: String(body.seccion),
    } as CreationAttributes<UsuariosEntry>);

    await this.usuarioRolesRepository.create({
      usuario_id: usuario.id,
      rol_id: body.rol_id,
    } as CreationAttributes<UsuarioRolesEntry>);

    return this.usuariosRepository.findByPk(usuario.id, {
      include: [RolesEntry],
    });
  }

  async eliminarUsuario(id: string) {
    await this.usuarioRolesRepository.destroy({
      where: { usuario_id: id },
    });

    return this.usuariosRepository.destroy({
      where: { id },
    });
  }
}
