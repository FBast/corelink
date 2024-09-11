const express = require('express');
const { createUser, getUsers, getUserById, updateUser, deleteUser, verifyUser, loginUser} = require('../controllers/userController');
const router = express.Router();

router.post('/', createUser);
router.post('/verify', verifyUser);
router.post('/login', loginUser);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
