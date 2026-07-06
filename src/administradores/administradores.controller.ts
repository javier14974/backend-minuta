import { Body, Controller, Get, Post } from "@nestjs/common";
import { AdministradoresServices } from "./administradores.services";

@Controller('administradores')
export class AdministradoresController {
    constructor(private readonly administradoresServices: AdministradoresServices) {}


    
    @Post('login')
    async login(@Body() body: { email: string, contraseña: string }) {
        return this.administradoresServices.LoginDto(body);
    }


}