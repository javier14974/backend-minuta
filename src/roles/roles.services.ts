import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { RolesEntry } from "./roles.entry";

@Injectable()
export class RolesService {
    constructor(
        @InjectModel(RolesEntry)
        private readonly rolesRepository: typeof RolesEntry,
    ) {}

    async getRoles() {
        return this.rolesRepository.findAll({
            attributes: ['id', 'nombre', 'seccion'],
        });
    }
}
