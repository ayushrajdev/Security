import express from 'express';
import bcrypt from 'bcrypt';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';

const app = express();
const PORT = 4000;

const limiter = rateLimit({
    windowMs: 5 * 1000,
    limit: 3,
});
// app.use(limiter)
app.use(helmet());

app.use((_, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

const rateLimitStore = {};

function rateLimiter({ windowSizeInSeconds, noOfRequests }) {
    return (req, res, next) => {
        const durationInSeconds = Math.round(
            (Date.now() - rateLimitStore[req.ip]?.startTime) / 1000,
        );
        if (
            !rateLimitStore[req.ip] ||
            durationInSeconds >= windowSizeInSeconds
        ) {
            rateLimitStore[req.ip] = {
                startTime: Date.now(),
                count: 1,
            };
            return next();
        } else {
            rateLimitStore[req.ip].count++;
        }

        if (rateLimitStore[req.ip].count > noOfRequests) {
            return res.status(429).end('hanged up!!!');
        }
        next();
    };
}

app.get('/', (_, res) => {
    res.send('<h1>Hello World!</h1>');
});

app.get(
    '/register',
    rateLimiter({ noOfRequests: 5, windowSizeInSeconds: 10 }),
    async (_, res) => {
        bcrypt.hashSync('123456', 14);
        return res.json({ message: 'Registered Successfully' });
    },
);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Visit http://localhost:${PORT}`);
});
