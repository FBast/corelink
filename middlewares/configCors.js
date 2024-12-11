import cors from 'cors';

const corsOptions = {
    origin: 'http://localhost:5173', // Origine spécifique autorisée
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Méthodes autorisées
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'], // En-têtes autorisés
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
