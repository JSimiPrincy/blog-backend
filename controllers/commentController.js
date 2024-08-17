// controllers/commentController.js
const Comment = require('../models/Comment');

exports.createComment = async (req, res) => {
  try {
    const { content, postId } = req.body;
    const comment = new Comment({
      content,
      author: req.user._id,
      post: postId
    });
    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create comment', error: error.message });
  }
};

exports.getCommentsByPost = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'username')
      .sort('-createdAt');
    res.json(comments);
  } catch (error) {
    res.status(400).json({ message: 'Failed to get comments', error: error.message });
  }
};
