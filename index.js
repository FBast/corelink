const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const morgan = require('morgan');
const configCors = require('./middlewares/configCors');
const apiKey = require('./middlewares/apiKey');

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

// Importer les routes
const baseRoutes = require('./routes/baseRoutes');
const userRoutes = require('./routes/userRoutes');

// Utiliser les routes
app.use('/corelink/api/', baseRoutes);
app.use('/corelink/api/users', userRoutes);

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