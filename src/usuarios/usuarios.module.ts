import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { RolesEntry } from "src/roles/roles.entry";
import { UsuarioRolesEntry } from "./entry/usuario-roles.entry";
import { UsuariosEntry } from "./entry/usuarios.entry";
import { UsuariosController } from "./usuarios.controller";
import { UsuariosServices } from "./usuarios.services";

@Module({
    imports: [SequelizeModule.forFeature([UsuariosEntry, RolesEntry, UsuarioRolesEntry])],
    providers: [UsuariosServices],
    controllers: [UsuariosController],
    exports: [UsuariosServices],
})
export class UsuariosModule {}
