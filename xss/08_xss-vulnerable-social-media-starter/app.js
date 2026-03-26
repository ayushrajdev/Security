import express from 'express';
import mongoose from 'mongoose';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

const app = express();

app.use(express.json());

await mongoose.connect('mongodb://127.0.0.1:27017/socialApp?authSource=admin');

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
             script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com/;\
             style-src 'self' 'unsafe-inline';\
             connect-src 'self' http://localhost:8000 \
             ",
        });
    }
    next();
});
// connect-src -> to which domain the website can send the send the fetch request
//unsafe-inline -> allow inline script to run 
app.use(express.static('./public'));

// Routes
app.get('/posts', async (req, res) => {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.setHeader('Set-Cookie', 'loginSecret=hdxhw7yrx.k;httpOnly=true');
    res.json(posts);
});

app.post('/posts', async (req, res) => {
    let content = req.body.content;
    content = purify.sanitize(content);

    const post = new Post({ content });
    await post.save();
    res.status(201).json(post);
});

// Start server
app.listen(4000, () => console.log('Server running on http://localhost:4000'));
