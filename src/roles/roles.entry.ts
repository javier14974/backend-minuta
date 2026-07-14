import { BelongsToMany, Column, DataType, Model, Table } from "sequelize-typescript";
import { UsuarioRolesEntry } from "src/usuarios/entry/usuario-roles.entry";
import { UsuariosEntry } from "src/usuarios/entry/usuarios.entry";

@Table({
  tableName: "Roles",
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
  declare nombre: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare seccion: string;

  @BelongsToMany(() => UsuariosEntry, () => UsuarioRolesEntry)
  declare usuarios: UsuariosEntry[];
}
