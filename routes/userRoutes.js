import { Router } from 'express';
import jwtAuth from "../middlewares/jwtAuth.js";
import adminAuth from "../middlewares/adminAuth.js";
import UserController from "../controllers/userController.js";

const router = Router();

// Routes publiques
router.post('/', UserController.createUser);      // Création d'un nouvel utilisateur
router.post('/verify', UserController.verifyUser); // Vérification de l'adresse email
router.post('/login', UserController.loginUser);   // Connexion utilisateur

// Route protégée pour récupérer les infos de l'utilisateur connecté
router.get('/me', jwtAuth, UserController.getUserProfile); // Récupérer les informations de l'utilisateur connecté
router.put('/me', jwtAuth, UserController.updateUserProfile); // Mettre à jour les informations de l'utilisateur connecté

// Routes réservées à l'administrateur
router.get('/', jwtAuth, adminAuth, UserController.getUsers);        // Liste de tous les utilisateurs (admin uniquement)
router.get('/:id', jwtAuth, adminAuth, UserController.getUserById);  // Détails d'un utilisateur (admin uniquement)
router.put('/:id', jwtAuth, adminAuth, UserController.updateUser);   // Mise à jour d'un utilisateur (admin uniquement)
router.delete('/:id', jwtAuth, adminAuth, UserController.deleteUser);// Suppression d'un utilisateur (admin uniquement)

export default router;
