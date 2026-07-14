import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { KeysEntry } from "src/keys/entry/keys.entry";

@Table({
    tableName: 'Secciones',
    timestamps: false,
})
export class SeccionesEntry extends Model<SeccionesEntry> {
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

    @HasMany(() => KeysEntry)
    keys: KeysEntry[];
}