﻿import cors from 'cors';

const corsOptions = {
    origin: '*', // Autorise toutes les origines
    credentials: true // Maintient l'envoi des cookies si nécessaire
};

// const corsOptions = {
//     origin: (origin, callback) => {
//         const allowedDomains = process.env.ALLOWED_DOMAINS ? process.env.ALLOWED_DOMAINS.split(',') : [];
//
//         if (!origin || allowedDomains.includes(origin)) {
//             callback(null, true);
//         } else {
//             callback(new Error('Accès non autorisé par CORS'));
//         }
//     },
//     credentials: true
// };

export default cors(corsOptions);
