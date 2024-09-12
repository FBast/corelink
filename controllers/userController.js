const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const {sendEmail} = require("../utils/emailService");
const {generateToken} = require("../utils/authUtils");

const createUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const validationToken = Math.floor(100000 + Math.random() * 900000).toString();  // Code à 6 chiffres
        const newUser = new User({
            email,
            password,
            validationToken,
            isVerified: false,
        });
        await newUser.save();

        const subject = 'Vérification de votre compte';
        const text = `Merci de vous être inscrit sur notre plateforme !\n\nVotre code de validation est : ${validationToken}\n\nVeuillez le saisir sur notre site pour activer votre compte.`;
        await sendEmail(newUser.email, subject, text);

        res.status(201).json({ message: 'Utilisateur créé avec succès ! Vérifiez votre email pour valider votre compte.' });
    } 
    catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur :', error);
        res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur', error });
    }
};

const verifyUser = async (req, res) => {
    try {
        const { email, token } = req.body;
        const user = await User.findOne({ email: email, validationToken: token });
        if (!user) {
            return res.status(400).json({ message: 'Code de validation invalide ou utilisateur inexistant.' });
        }

        user.status = 'pending_infos';
        user.validationToken = undefined;

        const authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({
            message: 'Compte vérifié avec succès !',
            token: authToken
        });

        await user.save();
    }
    catch (error) {
        res.status(500).json({ message: 'Erreur lors de la vérification du compte', error });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Trouver l'utilisateur par email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Vérification du mot de passe (assurez-vous de le faire avec bcrypt dans une vraie application)
        const isPasswordCorrect = user.password === password; // Remplacer par bcrypt.compare(password, user.password)
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Mot de passe incorrect" });
        }

        // Générer un token JWT
        const token = generateToken(user._id);

        // Ajouter le status à la réponse
        const status = user.status; // Assurez-vous que le modèle User a un champ "status"

        // Réponse avec le token et le status
        res.cookie('token', token, { httpOnly: true, secure: true });
        res.status(200).json({ message: 'Connexion réussie !', token, status });
    }
    catch (error) {
        res.status(500).json({ message: "Erreur lors de la connexion", error });
    }
};

// Fonction pour récupérer le profil de l'utilisateur connecté
const getUserProfile = async (req, res) => {
    try {
        // Récupérer l'utilisateur connecté à partir de l'ID dans req.user
        const user = await User.findById(req.user);

        // Vérifier si l'utilisateur existe
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Retourner les informations de l'utilisateur sans le mot de passe
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
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } 
    catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs', error });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.status(200).json(user);
    } 
    catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur', error });
    }
};

const updateUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { name, email, password }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.status(200).json(user);
    } 
    catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur', error });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.status(200).json({ message: 'Utilisateur supprimé' });
    } 
    catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur', error });
    }
};

module.exports = { createUser, verifyUser, loginUser, getUserProfile, getUsers, getUserById, updateUser, deleteUser };
