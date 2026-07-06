import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { AdministradoresServices } from "./administradores.services";
import { AdministradoresEntry } from "./entry/administradores.entry";
import { AdministradoresController } from "./administradores.controller";

@Module({
    imports: [SequelizeModule.forFeature([AdministradoresEntry])],
    providers: [AdministradoresServices],
    controllers: [AdministradoresController],
    exports: [AdministradoresServices],
})
export class AdministradoresModule {}
