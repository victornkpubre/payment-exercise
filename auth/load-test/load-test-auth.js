// load-test-auth.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 150,
  duration: '60s',
};

export default function () {
  const payload = JSON.stringify({
    idempotency_key: `key_${__VU}_${__ITER}`,
    card_pan_token: 'tok_8765',
    amount_kobo: 1000,
    currency: 'NGN',
    wallet_balance_kobo: 5000,
  });

  const headers = { 'Content-Type': 'application/json' };

  const res = http.post('http://host.docker.internal:3000/auth', payload, { headers });

  check(res, {
    'status is 201': (r) => r.status === 201,
  });
}