import { BelongsToMany, Column, DataType, Model, Table } from "sequelize-typescript";
import { UsuariosEntry } from "src/usuarios/entry/usuarios.entry";
import { UsuarioRolesEntry } from "src/usuarios/entry/usuario-roles.entry";

@Table({
    tableName: 'Roles',
    timestamps: false,
})
export class RolesEntry extends Model<RolesEntry> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      })
      declare id: number;
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    nombre: string; /* nombre del rol */

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    seccion: string; /* seccion del rol */

    @BelongsToMany(() => UsuariosEntry, () => UsuarioRolesEntry)
    usuarios: UsuariosEntry[];

}

