import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from "../utils/emailService.js";
import bcrypt from "bcrypt";

const UserController = {
    // Créer un utilisateur
    async createUser(req, res) {
        try {
            const { email, password } = req.body;
            const validationToken = Math.floor(100000 + Math.random() * 900000).toString();  // Code à 6 chiffres

            // Hash du mot de passe
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = new User({
                email,
                password: hashedPassword,
                validationToken,
                isVerified: false,
            });
            await newUser.save();

            const subject = 'Vérification de votre compte';
            const text = `Merci de vous être inscrit sur notre plateforme !\n\nVotre code de validation est : ${validationToken}\n\nVeuillez le saisir sur notre site pour activer votre compte.`;
            await sendEmail(newUser.email, subject, text);

            res.status(201).json({ message: 'Utilisateur créé avec succès ! Vérifiez votre email pour valider votre compte.' });
        } catch (error) {
            console.error('Erreur lors de la création de l\'utilisateur :', error);
            res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur', error });
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

            const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
                expiresIn: '1h'
            });

            const status = user.status;

            res.cookie('token', token, { httpOnly: true, secure: true });
            res.status(200).json({ message: 'Connexion réussie !', token, status });
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la connexion", error });
        }
    },

    // Reset du password
    async resetPassword(req, res) {
        try {
            const {email} = req.body;
            const validationToken = Math.floor(100000 + Math.random() * 900000).toString();  // Code à 6 chiffres

            // Trouver l'utilisateur par email et mettre à jour le validationToken
            const user = await User.findOneAndUpdate({ email: email }, { validationToken: validationToken }, { new: true });
            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }
            
            const subject = 'Réinitialisation du mot de passe';
            const text = `Vous avez demandé une réinitialisation de votre mot de passe !\n\nVotre code de validation est : ${validationToken}\n\nVeuillez le saisir sur notre site pour réinitialiser votre mot de passe.`;
            await sendEmail(email, subject, text);

            res.status(201).json({message: 'Réinitialisation en cours ! Vérifiez votre email pour changer votre mot de passe.'});
        } catch (error) {
            console.error('Erreur lors du reset du password :', error);
            res.status(500).json({message: 'Erreur lors du reset du password', error});
        }
    },
    
    // Récupération du profil utilisateur
    async getUserProfile(req, res) {
        try {
            const user = await User.findById(req.user.userId);

            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }

            const { _id, name, email, status, requestedFormation, requestedYear } = user;
            res.status(200).json({
                _id,
                name,
                email,
                status,
                requestedFormation,
                requestedYear
            });
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
    async getUserById(req, res) {
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
            const { name, email, password } = req.body;
            const user = await User.findByIdAndUpdate(req.params.id, { name, email, password }, { new: true });
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