import { Router } from 'express';
import jwtAuth from "../middlewares/jwtAuth.js";
import adminAuth from "../middlewares/adminAuth.js";
import GradeController from "../controllers/gradeController.js";

const router = Router();

// Admin routes for grades
router.post('/', jwtAuth, adminAuth, GradeController.createGrade);
router.get('/', jwtAuth, adminAuth, GradeController.getGrades); // Requires `formationId` as a query parameter
router.get('/:id', jwtAuth, adminAuth, GradeController.getGrade);
router.put('/:id', jwtAuth, adminAuth, GradeController.updateGrade);
router.delete('/:id', jwtAuth, adminAuth, GradeController.deleteGrade);
router.get('/:id/generate', jwtAuth, adminAuth, GradeController.generateExam);

export default router;