import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { SeccionesEntry } from "./entry/secciones.entry";
import { KeysEntry } from "src/keys/entry/keys.entry";
import { SeccionesServices } from "./secciones.services";
import { SeccionesController } from "./secciones.controller";


@Module({
    imports: [SequelizeModule.forFeature([SeccionesEntry, KeysEntry])],
    providers: [SeccionesServices],
    controllers: [SeccionesController],
    exports: [SeccionesServices],
})
export class SeccionesModule {}
