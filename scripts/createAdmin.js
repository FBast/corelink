import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from '../config/db.js';

// Charger les variables d'environnement depuis le fichier .env situé à la racine
dotenv.config({ path: path.resolve(path.dirname(''), '../.env') });

// Connexion à MongoDB puis ajout de l'admin
connectDB().then(async () => {
    try {
        const adminEmail = process.env.EMAIL_ADMIN;
        const adminPassword = process.env.PASSWORD_ADMIN;

        // Vérifier si l'admin existe déjà
        let admin = await User.findOne({ email: adminEmail });
        if (admin) {
            console.log("L'admin existe déjà, mise à jour des informations...");
            admin.password = await bcrypt.hash(adminPassword, 10);
            admin.role = 'admin';
            admin.status = 'verified';
        } else {
            // Créer un nouvel administrateur si aucun n'existe
            console.log("Aucun admin trouvé, création d'un nouvel admin...");
            admin = new User({
                email: adminEmail,
                password: await bcrypt.hash(adminPassword, 10),
                role: 'admin',
                status: 'verified',
            });
        }

        // Sauvegarder ou mettre à jour l'admin
        await admin.save();

        // Générer un token JWT pour l'admin
        const token = jwt.sign({ userId: admin._id, role: admin.role }, process.env.JWT_SECRET, {
            expiresIn: '30d', // Longue durée de validité du token : 30 jours
        });

        console.log('Administrateur ajouté ou mis à jour avec succès.');
        console.log(`JWT Token pour l'administrateur : ${token}`);

        process.exit(0); // Terminer le processus
    } catch (error) {
        console.error('Erreur lors de la création/mise à jour de l\'admin :', error);
        process.exit(1);
    }
});