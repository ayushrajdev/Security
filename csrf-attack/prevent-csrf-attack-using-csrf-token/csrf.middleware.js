import { csrfTokens } from './app.js';

export function csrfProtection(req, res, next) {
    if (!req.cookies.sid) {
        return res.send('You are not logged.');
    }

    if (req.method == 'GET' && req.headers?.accept?.includes('text/html')) {
        const csrfToken = randomBytes(16).toString('hex');
        csrfTokens[req.cookies.sid] = csrfToken;
        req.csrfToken = csrfToken;
    }
    if (req.method == 'POST') {
        if (csrfTokens[req.cookies.sid] !== req.body.csrfToken) {
            return res.end('invalid token');
        }
    }
    next();
}
