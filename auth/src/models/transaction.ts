import { Model, DataTypes, Sequelize } from "sequelize";

export class Transaction extends Model {
    public id!: number;
    public idempotency_key!: string;
    public status!: 'pending' | 'failed' | 'accepted';
    public amount_kobo!: number;
    public balance_kobo!: number;
    public currency!: string;
}


export const initTransactionModel = (sequelize: Sequelize) => {
    Transaction.init({
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      idempotency_key: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'failed', 'accepted'),
        allowNull: false,
      },
      amount_kobo: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      balance_kobo: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    }, {
      sequelize,
      tableName: 'transactions',
      timestamps: true,
    });
  };