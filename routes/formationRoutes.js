﻿import { Router } from 'express';
import jwtAuth from "../middlewares/jwtAuth.js";
import adminAuth from "../middlewares/adminAuth.js";
import FormationController from "../controllers/formationController.js";

const router = Router();

// User routes
router.get('/', jwtAuth, FormationController.getFormations);

// Admin routes
router.post('/', jwtAuth, adminAuth, FormationController.createFormation);
router.get('/:id', jwtAuth, adminAuth, FormationController.getFormation);
router.put('/:id', jwtAuth, adminAuth, FormationController.updateFormation);
router.delete('/:id', jwtAuth, adminAuth, FormationController.deleteFormation);
router.get('/:formationId/grades/:gradeId/generateExam', jwtAuth, adminAuth, FormationController.generateExam);

export default router;