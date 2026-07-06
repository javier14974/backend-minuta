import { Module } from "@nestjs/common";
import { RolesEntry } from "./roles.entry";
import { SequelizeModule } from "@nestjs/sequelize";
import { RolesService } from "./roles.services";
import { RolesController } from "./roles.controller";

@Module({
    imports: [SequelizeModule.forFeature([RolesEntry])],
    providers: [RolesService],
    controllers: [RolesController],
    exports: [RolesService],
})
export class RolesModule {}
