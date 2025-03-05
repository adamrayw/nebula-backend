import { Column, DataType, Default, Model, PrimaryKey, Table } from "sequelize-typescript";

export interface ActivityData {
    userId: string;
    type: string;
    description: string;
}

@Table({
    tableName: 'Activities',
})
export class Activity extends Model<ActivityData> {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    id: string;

    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    userId: string;

    @Column({
        type: DataType.ENUM('upload', 'download', 'delete', 'share', 'edit', 'view'),
        allowNull: false,
    })
    type: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    description: string;
}