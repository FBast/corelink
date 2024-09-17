import mongoose from 'mongoose';

// Fonction de connexion à MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connecté');
    } catch (error) {
        console.error('Erreur de connexion MongoDB:', error);
        process.exit(1); // Arrêter l'application si MongoDB échoue
    }
};

// Exporter la fonction de connexion à MongoDB
export default connectDB;