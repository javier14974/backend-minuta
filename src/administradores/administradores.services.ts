import { Injectable } from "@nestjs/common";
import { AdministradoresEntry } from "./entry/administradores.entry";
import { InjectModel } from "@nestjs/sequelize";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AdministradoresServices {
    
    constructor(
        @InjectModel(AdministradoresEntry)
        private readonly administradoresRepository: typeof AdministradoresEntry,
    ) {}


    async LoginDto(body: LoginDto) {
        return this.administradoresRepository.findOne({
            where: { email: body.email, contraseña: body.contraseña },
        });
    }
}