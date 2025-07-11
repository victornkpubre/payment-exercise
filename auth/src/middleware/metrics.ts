import { NextFunction, Request, Response } from "express";
import client from 'prom-client';



const httpRequestDurationSummary = new client.Summary({
    name: 'http_request_duration_summary_ms',
    help: 'Summary of HTTP request durations in ms',
    labelNames: ['method', 'route', 'code'],
    percentiles: [0.5, 0.9, 0.95, 0.99],  
  });

export const prometheusMetricMiddleware = (req: Request, res: Response, next: NextFunction):void => {

    const end = httpRequestDurationSummary.startTimer();

    res.on('finish', async () => {
        end({ method: req.method, route: req.route?.path || req.path, code: res.statusCode.toString() });

        //p95 Log
        const metrics = await httpRequestDurationSummary.get();
        const p95 = metrics.values.find(v => (v.labels as any).quantile === '0.95');
        if (p95) {
          console.log(`p95 latency: ${p95.value.toFixed(2)} ms`);
        }

    });

    next();
}

export const register = client.register;