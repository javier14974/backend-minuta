import { BelongsToMany, Column, DataType, Model, Table } from "sequelize-typescript";
import { RolesEntry } from "src/roles/roles.entry";
import { UsuarioRolesEntry } from "./usuario-roles.entry";


@Table({
  tableName: 'Usuarios',
  timestamps: false,
})
export class UsuariosEntry extends Model<UsuariosEntry> {
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
    nombre: string;
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    email: string;
    
    @BelongsToMany(() => RolesEntry, () => UsuarioRolesEntry)
    roles: RolesEntry[]
  }