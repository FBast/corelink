﻿import { Router } from 'express';
import jwtAuth from "../middlewares/jwtAuth.js";
import adminAuth from "../middlewares/adminAuth.js";
import FormationController from "../controllers/formationController.js";

const router = Router();

// Admin routes for formations
router.post('/', jwtAuth, adminAuth, FormationController.createFormation);
router.get('/', jwtAuth, adminAuth, FormationController.getFormations);
router.get('/:id', jwtAuth, adminAuth, FormationController.getFormation);
router.put('/:id', jwtAuth, adminAuth, FormationController.updateFormation);
router.delete('/:id', jwtAuth, adminAuth, FormationController.deleteFormation);

export default router;