import express from 'express';
import cookieParse from 'cookie-parser';
import { randomBytes } from 'crypto';
import { csrfProtection } from './csrf.middleware.js';

const app = express();
const PORT = 4000;
let amount = 10000;

app.use(cookieParse());
app.use(express.urlencoded({ extended: false }));

export const csrfTokens = {};

// Middleware to set CSP
app.use((req, res, next) => {
    if (req.headers.accept?.includes('text/html')) {
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader(
            'Content-Security-Policy',
            `default-src 'self'; script-src 'self';\
       frame-ancestors 'none'`,
        );
    }
    next();
});

// Serve dynamic HTML
app.get('/', csrfProtection, (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Bank App</title>
      <meta charset="UTF-8" />
    </head>
    <body>
      <h1>Amount: ₹<span id="amount">${amount}</span></h1>
      <form method="POST" action="/pay">
        <input name="csrfToken" value="${csrfToken}" hidden>
        <button type="submit">Pay</button>
      </form>
      <script>

      const form = document.querySelector('form');
      form.addEventListener('submit', (e) => {
          e.preventDefault();
          fetch('/pay', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'X-Csrf-Token': '1234',
            },
      });
    });
  </script>
    </body>
    </html>
  `);
});

// Handle payment
app.post('/pay', csrfProtection, (req, res) => {
    if (!req.headers['x-csrf-token']) {
        return res.end('csrf header is missing');
    }
    amount -= 1000;
    res.redirect('/');
});

app.get('/login', (req, res) => {
    const sid = randomBytes(16).toString('hex');
    res.cookie('sid', sid, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
    });
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`🚀 Visit http://localhost:${PORT}`);
});
