const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/signin', userController.signin);
router.post('/signin/new_token', userController.newToken);
router.post('/signup', userController.register);
router.get('/info', authMiddleware, userController.info); //auth access
router.get('/logout', authMiddleware, userController.logout); //auth access

module.exports = router;