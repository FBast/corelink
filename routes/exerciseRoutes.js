import { Router } from 'express';
import jwtAuth from "../middlewares/jwtAuth.js";
import adminAuth from "../middlewares/adminAuth.js";
import ExerciseController from "../controllers/exerciseController.js";

const router = Router();

// Admin routes
router.post('/', jwtAuth, adminAuth, ExerciseController.createExercise);
router.get('/', jwtAuth, adminAuth, ExerciseController.getExercises);
router.get('/:id', jwtAuth, adminAuth, ExerciseController.getExercise);
router.put('/:id', jwtAuth, adminAuth, ExerciseController.updateExercise);
router.delete('/:id', jwtAuth, adminAuth, ExerciseController.deleteExercise);

export default router;
