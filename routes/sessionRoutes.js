﻿import { Router } from 'express';
import jwtAuth from "../middlewares/jwtAuth.js";
import adminAuth from "../middlewares/adminAuth.js";
import SessionController from "../controllers/sessionController.js";

const router = Router();

// Routes pour les sessions
router.post('/', jwtAuth, adminAuth, SessionController.createSession);
router.get('/', jwtAuth, adminAuth, SessionController.getSessions);
router.get('/:id', jwtAuth, adminAuth, SessionController.getSession);
router.put('/:id', jwtAuth, adminAuth, SessionController.updateSession);
router.delete('/:id', jwtAuth, adminAuth, SessionController.deleteSession);

export default router;