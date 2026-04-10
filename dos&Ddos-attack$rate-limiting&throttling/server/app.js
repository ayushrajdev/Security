import helmet from 'helmet';
import bcrypt from 'bcrypt';
import express from 'express';
import { slowDown } from 'express-slow-down';
import { rateLimit } from 'express-rate-limit';

const app = express();
const PORT = 4000;

const limiter = rateLimit({
    windowMs: 5 * 1000,
    limit: 3,
});

const throttleApi = slowDown({
    delayMs: (hits) => hits * 1000,
    windowMs: 5000,
    delayAfter: 2,
});

app.use(helmet());

app.use((_, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

const rateLimitStore = {};
const throttleList = {};

function throttle({ delay, path, windowSizeInSeconds }) {
    console.log(throttleList);
    return (req, res, next) => {
        if (!throttleList[req.ip]) {
            throttleList[req.ip] = {
                [path]: { count: 1, lastRequestTime: Date.now() },
            };
            return next();
        }

        const { lastRequestTime, count } = throttleList[req.ip][path];

        const durationInSeconds = (Date.now() - lastRequestTime) / 1000;

        if (durationInSeconds > 2) {
            throttleList[req.ip] = {
                [path]: { count: 1, lastRequestTime: Date.now() },
            };
            return next();
        } else {
            setTimeout(next, delay * throttleList[req.ip][path].count++);
        }
    };
}

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

app.use(limiter, throttleApi);
// app.use(
//     rateLimiter({ noOfRequests: 5, windowSizeInSeconds: 10 }),
//     throttle({ delay: 1000, path: '/register', windowSizeInSeconds: 5 }),
// );

app.get('/register', async (_, res) => {
    bcrypt.hashSync('123456', 14);
    return res.json({ message: 'Registered Successfully' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Visit http://localhost:${PORT}`);
});

// function throttle(waitTime = 1000) {
//   const throttleData = {};
//   return (req, res, next) => {
//     const now = Date.now();
//     const { previousDelay, lastRequestTime } = throttleData[req.ip] || {
//       previousDelay: 0,
//       lastRequestTime: now - waitTime,
//     };

//     const timePassed = now - lastRequestTime;
//     const delay = Math.max(0, waitTime + previousDelay - timePassed);

//     throttleData[req.ip] = {
//       previousDelay: delay,
//       lastRequestTime: now,
//     };

//     setTimeout(next, delay);
//   };
// }
