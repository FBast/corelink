import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectDB from './config/db.js';
import configCors from './middlewares/configCors.js';
import apiKey from './middlewares/apiKey.js';
import baseRoutes from './routes/baseRoutes.js';
import userRoutes from './routes/userRoutes.js';
import topicRoutes from "./routes/topicRoutes.js";
import exerciseRoutes from "./routes/exerciseRoutes.js";
import formationRoutes from "./routes/formationRoutes.js";
import gradeRoutes from "./routes/gradeRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
// import './utils/cronJobs.js';

// Charger les variables d'environnement
dotenv.config();

// Créer une application Express
const app = express();

// Middlewares
app.use(express.json());
app.use(morgan('dev'));

// Appliquer le middleware CORS
app.use(configCors);

// Appliquer le middleware pour valider la clé d'API sur les routes publiques
app.use(apiKey);

// Utiliser les routes
app.use('/corelink/api/', baseRoutes);
app.use('/corelink/api/users', userRoutes);
app.use('/corelink/api/topics', topicRoutes);
app.use('/corelink/api/exercises', exerciseRoutes);
app.use('/corelink/api/formations', formationRoutes);
app.use('/corelink/api/grades', gradeRoutes);
app.use('/corelink/api/sessions', sessionRoutes);

// Lancer la connexion à MongoDB et démarrer le serveur
connectDB()
    .then(() => {
        // Démarrer le serveur uniquement si la connexion MongoDB a réussi
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Serveur démarré sur le port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Erreur lors de la connexion à MongoDB:', error);
        process.exit(1); // Arrêter le processus en cas d'échec de la connexion
    });
