const express = require('express');
const { createUser, verifyUser, loginUser, getUserProfile, updateUser, deleteUser, getUsers, getUserById } = require('../controllers/userController');
const jwtAuth = require("../middlewares/jwtAuth");
const adminAuth = require("../middlewares/adminAuth");
const router = express.Router();

// Routes publiques
router.post('/', createUser);      // Création d'un nouvel utilisateur
router.post('/verify', verifyUser); // Vérification de l'adresse email
router.post('/login', loginUser);   // Connexion utilisateur

// Route protégée pour récupérer les infos de l'utilisateur connecté
router.get('/me', jwtAuth, getUserProfile); // Récupérer les informations de l'utilisateur connecté

// Routes réservées à l'administrateur
router.get('/', jwtAuth, adminAuth, getUsers);        // Liste de tous les utilisateurs (admin uniquement)
router.get('/:id', jwtAuth, adminAuth, getUserById);  // Détails d'un utilisateur (admin uniquement)
router.put('/:id', jwtAuth, adminAuth, updateUser);   // Mise à jour d'un utilisateur (admin uniquement)
router.delete('/:id', jwtAuth, adminAuth, deleteUser);// Suppression d'un utilisateur (admin uniquement)

module.exports = router;
