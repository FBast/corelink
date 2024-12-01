import { Router } from 'express';
import jwtAuth from "../middlewares/jwtAuth.js";
import adminAuth from "../middlewares/adminAuth.js";
import GradeController from "../controllers/gradeController.js";

const router = Router();

// User routes
router.get('/', jwtAuth, GradeController.getGrades);

// Admin routes
router.post('/', jwtAuth, adminAuth, GradeController.createGrade);
router.get('/:id', jwtAuth, adminAuth, GradeController.getGrade);
router.put('/:id', jwtAuth, adminAuth, GradeController.updateGrade);
router.delete('/:id', jwtAuth, adminAuth, GradeController.deleteGrade);
router.get('/:id/generate', jwtAuth, adminAuth, GradeController.generateExam);

export default router;