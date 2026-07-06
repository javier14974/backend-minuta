import { Controller, Get } from "@nestjs/common";
import { RolesService } from "./roles.services";



@Controller('roles')
export class RolesController {
    constructor(private readonly rolesServices: RolesService) {}


    @Get('obtener_roles')
    async getRoles() {
        return this.rolesServices.getRoles();
    }
}