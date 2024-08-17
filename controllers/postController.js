// Posts controller
const mongoose = require('mongoose');
const Post = require('../models/Post');

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    console.log('Creating post. User:', req.user);
    const { title, content } = req.body;
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    const post = new Post({
      title,
      content,
      author: {
        id: req.user._id,
        username: req.user.username
      }
    });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error('Failed to create post:', error);
    res.status(400).json({ message: 'Failed to create post', error: error.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.title = req.body.title || post.title;
    post.content = req.body.content || post.content;

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    await post.remove();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




