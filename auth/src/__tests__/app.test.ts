import request from 'supertest';
import app from '../index';

import { Transaction, Account, Entry } from '../models';
import { getAccountId } from '../service/get_account_id';
import { sequelize } from '../config/database';

jest.mock('../service/get_account_id');

// Manual mock implementations
(Transaction.findOne as jest.Mock) = jest.fn();
(Transaction.create as jest.Mock) = jest.fn();
(Transaction.update as jest.Mock) = jest.fn();
(Entry.create as jest.Mock) = jest.fn();
(Account.findOne as jest.Mock) = jest.fn();
(Account.findOrCreate as jest.Mock) = jest.fn();
(Entry.destroy as jest.Mock) = jest.fn();
(Transaction.destroy as jest.Mock) = jest.fn();
(Account.destroy as jest.Mock) = jest.fn();
(getAccountId as jest.Mock) = jest.fn();

const validPayload = {
    idempotency_key: 'afsgdhftjyghku',
    card_pan_token: 'tok_8765',
    amount_kobo: 1000,
    currency: 'NGN',
    wallet_balance_kobo: 5000,
};

beforeEach(async () => {
    jest.clearAllMocks();
  
    sequelize.transaction = jest.fn().mockImplementation(async (cb) => cb());
  
    (Transaction.findOne as jest.Mock).mockResolvedValue(null);
    (Transaction.create as jest.Mock).mockResolvedValue({
      idempotency_key: validPayload.idempotency_key,
      status: 'pending',
    });
    (Transaction.update as jest.Mock).mockResolvedValue([1]);
  
    (getAccountId as jest.Mock).mockReturnValue(1);
    (Account.findOne as jest.Mock).mockResolvedValue({ id: 1, name: 'user_account' });
    (Account.findOrCreate as jest.Mock).mockResolvedValue([{ id: 2, name: 'user_account_card_liability' }, true]);
  
    (Entry.create as jest.Mock).mockResolvedValue({});
  
    (Entry.destroy as jest.Mock).mockResolvedValue(undefined);
    (Transaction.destroy as jest.Mock).mockResolvedValue(undefined);
    (Account.destroy as jest.Mock).mockResolvedValue(undefined);
  
    await Entry.destroy({ where: {}, truncate: true, cascade: true });
    await Transaction.destroy({ where: {}, truncate: true, cascade: true });
    await Account.destroy({ where: {}, truncate: true, cascade: true });
});

test('should return 400 if validation fails (missing fields)', async () => {
const response = await request(app).post('/auth').send({
    card_pan_token: 'token',
    amount_kobo: 100,
    currency: 'NGN',
    wallet_balance_kobo: 1000,
});

expect(response.status).not.toBe(201);
});

describe('POST /auth', () => {
  
    beforeAll(() => {
        jest.resetModules();
        jest.doMock('../middleware/validate-request', () => ({
          validateRequest: (req: any, res: any, next: any) => next(),
        }));
    });

    const app = require('../index').default;

    const validPayload = {
      idempotency_key: 'afsgdhftjyghku',
      card_pan_token: 'tok_8765',
      amount_kobo: 1000,
      currency: 'NGN',
      wallet_balance_kobo: 5000,
    };
  
    test('should return 204 if transaction with idempotency_key exists and status is pending', async () => {
        
        (Transaction.findOne as jest.Mock).mockResolvedValue({ status: 'pending' });

        const response = await request(app).post('/auth').send(validPayload);

        expect(Transaction.findOne).toHaveBeenCalledWith({
        where: { idempotency_key: validPayload.idempotency_key },
        });
        expect(response.status).toBe(204);
        expect(response.body).toEqual({});
    });

    test('should return approved false and auth_code 51 if wallet balance insufficient', async () => {
        const lowBalancePayload = {
        ...validPayload,
        idempotency_key: 'unique-key-1',
        wallet_balance_kobo: 50,
        };

        const response = await request(app).post('/auth').send(lowBalancePayload);

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
        approved: false,
        auth_code: '51',
        balance_left: lowBalancePayload.wallet_balance_kobo,
        });
    });

    test('should approve transaction and create double entries when balance sufficient', async () => {
        const response = await request(app).post('/auth').send(validPayload);

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
        approved: true,
        auth_code: '00',
        balance_left: validPayload.wallet_balance_kobo - validPayload.amount_kobo,
        });

        expect(Entry.create).toHaveBeenCalledTimes(2);

        expect(Entry.create).toHaveBeenCalledWith(
        expect.objectContaining({
            account_id: 1,
            amount: validPayload.amount_kobo,
            type: 'debit',
            description: 'Card Payment',
        }),
        expect.any(Object)
        );

        expect(Entry.create).toHaveBeenCalledWith(
        expect.objectContaining({
            account_id: 2,
            amount: validPayload.amount_kobo,
            type: 'credit',
            description: 'Card Payment',
        }),
        expect.any(Object)
        );
    });

    test('should return approved true with correct balance for accepted existing transaction', async () => {
        (Transaction.findOne as jest.Mock).mockResolvedValue({
        status: 'accepted',
        balance_kobo: 4000,
        amount_kobo: 1000,
        });

        const response = await request(app).post('/auth').send(validPayload);

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
        approved: true,
        auth_code: '00',
        balance_left: 4000 - 1000,
        });
    });
});
