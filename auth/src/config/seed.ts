import { Account } from '../models/account';

export async function seedAccounts() {
  console.log('>> Seeding accounts...');

  const count = await Account.count();
  console.log(`>> Account count before seeding: ${count}`);
  if (count > 0) return;

  await Account.bulkCreate([
    { name: 'agBBubdkk' },
    { name: 'qgashtwrs' },
    { name: 'argshdthd' },
    { name: 'afsgdthgf' },
    { name: 'hkygjfffv' },
  ]);

  const newcount = await Account.count();

  console.log('>> Accounts seeded!');
  console.log(`>> Account count before seeding: ${newcount}`);
}