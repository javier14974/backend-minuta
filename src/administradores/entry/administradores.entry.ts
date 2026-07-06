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
    nombre: string;
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    email: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
      })
      contraseña: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    seccion: string;
  }