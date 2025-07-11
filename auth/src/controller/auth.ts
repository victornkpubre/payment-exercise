import express, {Request, Response} from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate-request';
import { sequelize } from '../config/database';

import { Transaction, Account, Entry } from '../models';
import { getAccountId } from '../service/get_account_id';


const router = express.Router();

router.post('/', 
    [
        body('idempotency_key').notEmpty(),
        body('card_pan_token').notEmpty(),
        body('amount_kobo').isInt({gt: -1}),
        body('currency').notEmpty(),
        body('wallet_balance_kobo').isInt({gt: -1}),
    ],
    validateRequest,
    async (req: Request, res: Response) => {

    //extract 
    const {
        idempotency_key,
        card_pan_token,
        amount_kobo,
        currency,
        wallet_balance_kobo
    } = req.body;

    // idempotency - check transaction table if transaction exist return the status 
    let transaction
    try {
        transaction = await Transaction.findOne({where: {idempotency_key}});
    } catch (error) {
        // console.error("Error fetching transaction:", error);
        transaction = null;
    }

    if (transaction) {
        // console.log('transaction exists');
        if(transaction.status==='pending') {
            // console.log('Returning 204 transaction pending');
            return res.status(204).send({});
            
        }
        else {

            const balance = transaction.status==='accepted'? 
                transaction.balance_kobo - transaction.amount_kobo:
                transaction.balance_kobo;

            // console.log('Returning 200 transaction:', transaction.status);

            return res.status(201).json({ 
                "approved": transaction.status==='accepted'?true: false, 
                "auth_code": transaction.status==='accepted'?'00': '51',
                "balance_left": balance
            });
        }
        
    }
    else {
        transaction = await Transaction.create(
            {
              idempotency_key,
              status: 'pending',
              amount_kobo,
              currency,
              balance_kobo: wallet_balance_kobo
            },
        );
    }

    // check that account balance is sufficent 
    if (wallet_balance_kobo - amount_kobo < 0) {
        await sequelize.transaction(async (t) => {
          await Transaction.update(
            {
              status: 'failed',
              amount_kobo,
              currency,
              balance_kobo: wallet_balance_kobo
            },
            {
              where: { idempotency_key },
              transaction: t
            }
          );
        });
      
        return res.status(201).json({
          approved: false,
          auth_code: '51',
          balance_left: wallet_balance_kobo
        });
    }


    await sequelize.transaction(async (t) => {

        await Transaction.update(
            {
              idempotency_key,
              status: 'accepted',
              amount_kobo,
              currency,
              balance_kobo: wallet_balance_kobo - amount_kobo
            },
            {
              where: { idempotency_key },
              transaction: t
            }
        );

        const updatedTransaction = await Transaction.findOne({
            where: { idempotency_key },
            transaction: t
          });

        // double entry - get user and card_liability account ids 
        const card_account_id = getAccountId(card_pan_token);
        const account = await Account.findOne({
            where: { id: card_account_id }
        });

        const card_liability_acc_name = account!.name+'_card_liability'
        const [card_liability, result]   = await Account.findOrCreate({
            where: { name: card_liability_acc_name }
        });
        const card_liability_acc_id = card_liability.id;

        // double entry - debit card account
        await Entry.create(
            {
                account_id: card_account_id,
                transaction_id: updatedTransaction!.id,
                amount_kobo,
                type: 'debit',
                description: 'Card Payment'
            },
            { transaction: t }
        );

        // double entry - credit card liability account
        await Entry.create(
            {
                account_id: card_liability_acc_id,
                transaction_id: updatedTransaction!.id,
                amount_kobo,
                type: 'credit',
                description: 'Card Payment'
            },
            { transaction: t }
        );

    });

    

    // console.log('Returning 201 transaction successful');

    return res.status(201).json({ 
        "approved": true, 
        "auth_code": '00',
        "balance_left": wallet_balance_kobo - amount_kobo
    }); 

    //if it doesnt add entry to transaction - id, idem_key, status 
    //check that account balance is sufficent 
    //if it isnt update transaction status and return failed status 
    //if it is add entry to entries update transactions table return accepted staus 
});

export { router as authRouter };