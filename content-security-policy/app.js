import express from 'express';
import mongoose from 'mongoose';
import crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';

const hash = crypto.createHash('sha256').update('.').digest('base64');
console.log(hash, 'hash');
const app = express();

app.use(express.json());

await mongoose.connect('mongodb://localhost:27017/socialApp?authSource=admin');

const postSchema = new mongoose.Schema({
    content: String,
    createdAt: { type: Date, default: Date.now },
});

const Post = mongoose.model('Post', postSchema);

// Middleware

app.use((req, res, next) => {
    if (req.headers.accept?.includes('text/html')) {
        //CSP header
        res.set({
            'Content-Security-Policy':
                "default-src 'self';\
             script-src 'self' 'report-sample' 'sha256-yfoLJiHCQFw/trvidW8/tMmc7QsEOvLQXc5iiIUm5eU=' https://cdn.tailwindcss.com/;\
             style-src 'self' 'unsafe-inline';\
             connect-src 'self' http://localhost:8000; \
             report-uri /csp-violations",
        });
    }
    next();
});
// connect-src -> to which domain the website can send the send the fetch request
//unsafe-inline -> allow inline script to run

app.use(async (req, res, next) => {
    const nonce = crypto.randomBytes(16).toString('base64url');
    if (req.headers.accept?.includes('text/html')) {
        res.setHeader(
            'Content-Security-Policy',
            `default-src 'self';\
       script-src 'self' 'nounce=${nonce}' https://*.tailwindcss.com;\
       img-src 'self' https://images.unsplash.com;\
       style-src 'self' 'unsafe-inline';\
       connect-src 'self'`,
        );
    }
    if (req.url == '/') {
        const indexHtmlFile = await readFile('./public/index.html', {
            encoding: 'utf8',
        });
        console.log(nonce);
        return res.send(indexHtmlFile.replace('${nounce}', nonce));
    }
    next();
});

app.use(express.static('./public'));

// Routes
app.get('/posts', async (req, res) => {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.setHeader('Set-Cookie', 'loginSecret=hdxhw7yrx.k;');
    res.json(posts);
});

app.post('/posts', async (req, res) => {
    const post = new Post({ content: req.body.content });
    await post.save();
    res.status(201).json(post);
});

app.post(
    '/csp-violations',
    express.json({ type: 'application/csp-report' }),
    (req, res, next) => {
        console.log(req.body);
        res.end(JSON.stringify(req.body));
    },
);

// Start server
app.listen(4000, () => console.log('Server running on http://localhost:4000'));
