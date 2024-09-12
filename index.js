const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
require('./config/db'); // Importer la connexion MongoDB
const configCors = require('./middlewares/configCors'); // Middleware pour CORS
const apiKey = require('./middlewares/apiKey'); // Middleware pour la clé d'API

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

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});