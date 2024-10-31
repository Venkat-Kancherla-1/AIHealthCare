const express = require('express');
const { signup, signin, updateProfile, getUserInfo } = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin)
router.post('/update-profile', authenticateToken, updateProfile);
router.get('/info', authenticateToken, getUserInfo);

module.exports = router;
