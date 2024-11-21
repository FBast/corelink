import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import {sendEmail, sendVerificationCode} from "../utils/emailService.js";
import bcrypt from "bcrypt";

const UserController = {
    async resendVerificationCode(req, res) {
        try {
            const { email } = req.body;

            // Trouver l'utilisateur par email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé.' });
            }

            // Vérifier si l'utilisateur est déjà vérifié
            if (user.status === "verified") {
                return res.status(400).json({ message: 'Ce compte est déjà vérifié.' });
            }

            // Envoyer le code de vérification
            await sendVerificationCode(user);

            res.status(200).json({ message: 'Le code de vérification a été renvoyé avec succès.' });
        } catch (error) {
            console.error('Erreur lors du renvoi du code de vérification :', error);
            res.status(500).json({ message: 'Erreur lors du renvoi du code de vérification' });
        }
    },

    // Création de l'utilisateur avec envoi du code de validation
    async createUser(req, res) {
        try {
            const { email, password } = req.body;

            // Vérifier si l'utilisateur existe déjà
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
            }

            // Hash du mot de passe
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = new User({
                email,
                password: hashedPassword,
                isVerified: false,
            });
            await newUser.save();

            // Appeler la fonction pour envoyer le code de vérification
            await sendVerificationCode(newUser);

            res.status(201).json({ message: 'Utilisateur créé avec succès ! Vérifiez votre email pour valider votre compte.' });
        } catch (error) {
            console.error('Erreur lors de la création de l\'utilisateur :', error);
            res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur' });
        }
    },

    // Vérification de l'utilisateur
    async verifyUser(req, res) {
        try {
            const { email, token } = req.body;
            const user = await User.findOne({ email: email, validationToken: token });
            if (!user) {
                return res.status(400).json({ message: 'Code de validation invalide ou utilisateur inexistant.' });
            }

            user.status = 'verified';
            user.validationToken = undefined;

            const authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({
                message: 'Compte vérifié avec succès !',
                token: authToken
            });

            await user.save();
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la vérification du compte', error });
        }
    },

    // Connexion de l'utilisateur
    async loginUser(req, res) {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: "Utilisateur non trouvé" });
            }

            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            if (!isPasswordCorrect) {
                return res.status(401).json({ message: "Mot de passe incorrect" });
            }

            const token = jwt.sign({ 
                userId: user._id, 
                role: user.role,
                status: user.status
            }, process.env.JWT_SECRET, {
                expiresIn: '1h'
            });

            const status = user.status;

            res.cookie('token', token, { httpOnly: true, secure: true });
            res.status(200).json({ message: 'Connexion réussie !', token, status });
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la connexion", error });
        }
    },

    // Request a password reset
    async requestPasswordReset(req, res) {
        try {
            const {email} = req.body;
            const validationToken = Math.floor(100000 + Math.random() * 900000).toString();  // Code à 6 chiffres

            // Trouver l'utilisateur par email et mettre à jour le validationToken
            const user = await User.findOneAndUpdate({ email: email }, { validationToken: validationToken }, { new: true });
            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }
            
            const subject = 'Réinitialisation du mot de passe';
            const text = `Vous avez demandé une réinitialisation de votre mot de passe 
            \nVotre code de validation est : ${validationToken}
            \nVeuillez le saisir sur notre site pour réinitialiser votre mot de passe.`;
            await sendEmail(email, subject, text);

            res.status(201).json({message: 'Réinitialisation en cours ! Vérifiez votre email pour changer votre mot de passe.'});
        } catch (error) {
            console.error('Erreur lors du reset du password :', error);
            res.status(500).json({message: 'Erreur lors du reset du password', error});
        }
    },

    async resetPassword(req, res) {
        try {
            const { email, validationToken, newPassword } = req.body;

            // Trouver l'utilisateur par email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }

            // Vérifier si le validationToken correspond
            if (user.validationToken !== validationToken) {
                return res.status(400).json({ message: 'Code de validation invalide' });
            }

            // Optionnel : Vérifier si le code a expiré (si vous enregistrez une date d'expiration)
            if (user.validationTokenExpires && user.validationTokenExpires < Date.now()) {
                return res.status(400).json({ message: 'Le code de validation a expiré' });
            }

            // Mettre à jour le mot de passe
            user.password = await bcrypt.hash(newPassword, 10);

            // Supprimer le validationToken
            user.validationToken = undefined;
            user.validationTokenExpires = undefined;

            await user.save();

            res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });
        } catch (error) {
            console.error('Erreur lors de la réinitialisation du mot de passe :', error);
            res.status(500).json({ message: 'Erreur lors de la réinitialisation du mot de passe' });
        }
    },
    
    // Récupération du profil utilisateur
    async getUserProfile(req, res) {
        try {
            const user = await User.findById(req.user.userId);

            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }

            const { _id, name, email, status, requestedFormation, requestedGrade } = user;
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la récupération du profil utilisateur', error });
        }
    },

    // Mise à jour du profil utilisateur
    async updateUserProfile(req, res) {
        try {
            const userId = req.user.userId;

            if (req.body.password) {
                req.body.password = await bcrypt.hash(req.body.password, 10);
            }

            const user = await User.findByIdAndUpdate(userId, req.body, { new: true });

            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }

            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la mise à jour de vos informations', error });
        }
    },

    // Récupérer tous les utilisateurs
    async getUsers(req, res) {
        try {
            const users = await User.find();
            res.status(200).json(users);
        } catch (error) {
            console.error("Erreur MongoDB:", error);
            res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs', error });
        }
    },

    // Récupérer un utilisateur par son ID
    async getUser(req, res) {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur', error });
        }
    },

    // Mettre à jour un utilisateur
    async updateUser(req, res) {
        try {
            const userId = req.params.id;

            if (req.body.password) {
                req.body.password = await bcrypt.hash(req.body.password, 10);
            }

            const user = await User.findByIdAndUpdate(userId, req.body, { new: true });

            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }

            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur', error });
        }
    },
    
    // Supprimer un utilisateur
    async deleteUser(req, res) {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }
            res.status(200).json({ message: 'Utilisateur supprimé' });
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur', error });
        }
    }
};

export default UserController;