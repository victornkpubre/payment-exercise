import express from 'express';
import {json} from 'body-parser';
import { connectDB } from './config/database';
import { authRouter } from './controller/auth';
import { metricsRouter } from './controller/metrics';
import client from 'prom-client';
import { prometheusMetricMiddleware } from './middleware/metrics';


const app = express();
app.use(json());

client.collectDefaultMetrics();
app.use(prometheusMetricMiddleware);

app.use('/auth', authRouter);
app.use('/metrics', metricsRouter);

if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(3000, () => {
      console.log(`Listening on port ${3000}`);
    });
  }).catch(err => {
      console.error('Failed to start server:', err);
  });
}


export default app;