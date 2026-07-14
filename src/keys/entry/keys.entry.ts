
import { BelongsTo, BelongsToMany, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { SeccionesEntry } from "src/secciones/entry/secciones.entry";

@Table({
    tableName: 'Keys',
    timestamps: false,
})
export class KeysEntry extends Model<KeysEntry> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    declare id: number;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
        field: 'key',
    })
    declare nombre: string;

    @ForeignKey(() => SeccionesEntry)
    @Column({
      type: DataType.INTEGER,
      allowNull: false,
    })
    declare seccion_id: number;

    @BelongsTo(() => SeccionesEntry)
    declare seccion: SeccionesEntry;
}