import { Model, DataTypes, Sequelize } from "sequelize";
import { sequelize } from "../config/database";

export class Entry extends Model {
  public id!: number;
  public transaction_id!: number;
  public account_id!: number;
  public amount_kobo!: number;
  public description!: string;
}


export const initEntryModel = (sequelize: Sequelize) => {
  Entry.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    transaction_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    account_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    amount_kobo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    tableName: 'entries',
    timestamps: true,
  });
}
