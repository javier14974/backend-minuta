import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
  tableName: 'Administradores',
  timestamps: false,
})
export class AdministradoresEntry extends Model<AdministradoresEntry> {
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
    declare email: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
      })
      declare contraseña: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare seccion: string;
  }