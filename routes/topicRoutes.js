import { Router } from 'express';
import jwtAuth from "../middlewares/jwtAuth.js";
import adminAuth from "../middlewares/adminAuth.js";
import TopicController from "../controllers/topicController.js";
import {anyFilesUpload} from "../middlewares/fileUpload.js";

const router = Router();

// Admin routes
router.post('/', jwtAuth, adminAuth, TopicController.createTopic);
router.get('/', jwtAuth, adminAuth, TopicController.getTopics);
router.get('/:id', jwtAuth, adminAuth, TopicController.getTopic);
router.put('/:id', jwtAuth, adminAuth, anyFilesUpload, TopicController.updateTopic);
router.delete('/:id', jwtAuth, adminAuth, TopicController.deleteTopic);
router.post('/:id/exercises', jwtAuth, adminAuth, TopicController.addExercise);
router.delete('/:topicId/exercises/:exerciseId', jwtAuth, adminAuth, TopicController.deleteExercise);

export default router;