import { Sequelize } from 'sequelize';
import { seedAccounts } from './seed';
import { initTransactionModel } from '../models/transaction';
import { initAccountModel } from '../models/account';
import { initEntryModel } from '../models/entry';

// Use environment variables for sensitive data and flexibility
const DB_HOST = 'pg-db-svc';
const DB_PORT = 5432;
const DB_NAME = 'postgres';
const DB_USER = 'postgres';
const DB_PASS = 'postgres';

let sequelize: Sequelize;
if (process.env.NODE_ENV === 'test') {
  sequelize = {} as Sequelize;
} else {
  // Create a new Sequelize instance
  sequelize = new Sequelize({
    dialect: 'postgres',
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    username: DB_USER,
    password: DB_PASS,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });

}


async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log('Connection established successfully.');

        initTransactionModel(sequelize);
        initAccountModel(sequelize);
        initEntryModel(sequelize);
    
        await sequelize.sync({ alter: true }); 
        console.log('Tables created successfully.');

        await seedAccounts();
        console.log('Account table seeded successfully.');

      } catch (error) {
        console.error('Unable to connect or sync:', error);
      }
  }
  
  export { sequelize, connectDB};
