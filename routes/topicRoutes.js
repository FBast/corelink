import { Router } from 'express';
import jwtAuth from "../middlewares/jwtAuth.js";
import adminAuth from "../middlewares/adminAuth.js";
import TopicController from "../controllers/topicController.js";

const router = Router();

// User routes
router.get('/generate', jwtAuth, TopicController.generateExam);

// Admin routes
router.post('/', jwtAuth, adminAuth, TopicController.createTopic);
router.get('/', jwtAuth, adminAuth, TopicController.getTopics);
router.get('/:id', jwtAuth, adminAuth, TopicController.getTopic);
router.put('/:id', jwtAuth, adminAuth, TopicController.updateTopic);
router.delete('/:id', jwtAuth, adminAuth, TopicController.deleteTopic);

export default router;
