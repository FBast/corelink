import { Router } from 'express';
import jwtAuth from "../middlewares/jwtAuth.js";
import adminAuth from "../middlewares/adminAuth.js";
import {multipleFilesUpload, singleFileUpload} from "../middlewares/fileUpload.js";
import UserController from "../controllers/userController.js";

const router = Router();

// Public routes
router.post('/', UserController.createUser);
router.post('/resend-code', UserController.resendVerificationCode);
router.post('/verify', UserController.verifyUser);
router.post('/login', UserController.loginUser);
router.post('/request-password-reset', UserController.requestPasswordReset);
router.post('/reset-password', UserController.resetPassword);

// User routes
router.get('/me', jwtAuth, UserController.getUserProfile);
router.put('/me', jwtAuth, UserController.updateUserProfile);
router.post('/me/upload-report', jwtAuth, multipleFilesUpload(['examReport']), UserController.uploadExamReport);

// Admin routes
router.get('/', jwtAuth, adminAuth, UserController.getUsers);
router.get('/:id', jwtAuth, adminAuth, UserController.getUser);
router.put('/:id', jwtAuth, adminAuth, UserController.updateUser);
router.delete('/:id', jwtAuth, adminAuth, UserController.deleteUser);

export default router;