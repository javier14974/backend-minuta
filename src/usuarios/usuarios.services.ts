import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { RolesEntry } from "src/roles/roles.entry";
import { UsuariosEntry } from "./entry/usuarios.entry";

@Injectable()
export class UsuariosServices {
    constructor(
        @InjectModel(UsuariosEntry)
        private readonly usuariosRepository: typeof UsuariosEntry,
    ) {}

    async getUsuarios() {
        return this.usuariosRepository.findAll({
            include: [RolesEntry],
        });
    }
}