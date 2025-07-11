import express, {Request, Response} from 'express';
import client from 'prom-client';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        res.set('Content-Type', client.register.contentType);
        res.end(await client.register.metrics());
    } catch (ex) {
        res.status(500).end(ex);
    }
});

export { router as metricsRouter };