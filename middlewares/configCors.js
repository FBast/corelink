const configCors = require('cors');

const allowedDomains = process.env.ALLOWED_DOMAINS ? process.env.ALLOWED_DOMAINS.split(',') : [];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedDomains.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Accès non autorisé par CORS'));
        }
    },
    credentials: true
};

module.exports = configCors(corsOptions);
