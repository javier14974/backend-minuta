import { Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { RolesEntry } from "src/roles/roles.entry";
import { UsuariosEntry } from "./usuarios.entry";

@Table({
    tableName: 'UsuarioRoles',
    timestamps: false,
})
export class UsuarioRolesEntry extends Model<UsuarioRolesEntry> {
    @ForeignKey(() => UsuariosEntry)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    usuario_id: number;

    @ForeignKey(() => RolesEntry)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    rol_id: number;
}
