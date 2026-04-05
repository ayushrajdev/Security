import express from 'express';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = 4000;

app.use(cookieParser());

const authMiddleware = (req, res, next) => {
    if (req.cookies.sid || req.url === '/login') {
        return next();
    }
    return res.send('You are not logged in<br> <a href="/login">Login</a>');
};

app.use(authMiddleware, express.static('./public'));

app.get('/', authMiddleware, (req, res) => {
    res.send('Hello World');
});

//secure attribute -> send cookie to https connection only but works for localhost in development BUT not for the device ip address
app.get('/login', (req, res) => {
    // res.cookie('sid', '12345', { sameSite: 'none', secure: true });
    res.cookie('sid', '12345', { sameSite: 'lax', secure: true });

    //req.headers.referer -> the url who redirected to this endpoint
    res.redirect(req.headers.referer || '/');
});

app.listen(PORT, () => {
    console.log(`🚀 Visit http://localhost:${PORT}`);
});
