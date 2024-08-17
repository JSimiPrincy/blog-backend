// routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');

router.post('/', auth, commentController.createComment);
router.get('/post/:postId', commentController.getCommentsByPost);

module.exports = router;
