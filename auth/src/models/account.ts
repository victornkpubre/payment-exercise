import { Model, DataTypes, Sequelize } from "sequelize";

export class Account extends Model {
    public id!: number;
    public name!: string;
}

export const initAccountModel = (sequelize: Sequelize) => {
    Account.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        sequelize,
        tableName: 'accounts',
        timestamps: true,
    });
}
