const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');

// Charger les variables d'environnement
dotenv.config();

// Créer une application Express
const app = express();

// Middlewares
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

// Importer les routes
const baseRoutes = require('./routes/baseRoutes')
const userRoutes = require('./routes/userRoutes');

// Utiliser les routes
app.use('/corelink/api/', baseRoutes);
app.use('/corelink/api/users', userRoutes);

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connecté'))
    .catch((error) => console.log('Erreur de connexion MongoDB:', error));

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
