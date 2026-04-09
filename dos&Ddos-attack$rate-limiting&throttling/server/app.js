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
const throttleList = {};

function throttle({ delay, path, windowSizeInSeconds }) {
    console.log(throttleList);
    return (req, res, next) => {
        if (!throttleList[req.ip]) {
            throttleList[req.ip] = {
                [path]: { count: 1, startTime: Date.now() },
            };
            return next();
        } else {
            setTimeout(() => {
                const durationInSeconds =
                    (Date.now() - throttleList[req.ip][path].startTime) / 1000;

                if (durationInSeconds > windowSizeInSeconds * 1000) {
                    throttleList[req.ip] = {
                        [path]: { count: 1, startTime: Date.now() },
                    };
                    // console.log(throttleList[req.ip][path].count);
                    // console.log(throttleList);
                }
                next();
            }, delay * throttleList[req.ip][path].count++);
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

app.get(
    '/register',
    rateLimiter({ noOfRequests: 5, windowSizeInSeconds: 10 }),
    throttle({ delay: 1000, path: '/register', windowSizeInSeconds: 5 }),
    async (_, res) => {
        // bcrypt.hashSync('123456', 14);
        return res.json({ message: 'Registered Successfully' });
    },
);

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