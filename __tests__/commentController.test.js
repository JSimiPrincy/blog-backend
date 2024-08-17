// commentController.test.js
const mongoose = require('mongoose');
const { createComment, getCommentsByPost } = require('../controllers/commentController');
const Comment = require('../models/Comment');

// Mock the Comment model
jest.mock('../models/Comment');

describe('Comment Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      user: { _id: 'mockUserId' },
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createComment', () => {
    it('should create a new comment', async () => {
        req.body = { content: 'Test comment', postId: 'mockPostId' };
        const mockComment = { 
          content: 'Test comment',
          author: req.user._id,
          post: 'mockPostId',
          save: jest.fn().mockResolvedValue()
        };
        Comment.mockImplementation(() => mockComment);
      
        await createComment(req, res);
      
        expect(Comment).toHaveBeenCalledWith({
          content: 'Test comment',
          author: 'mockUserId',
          post: 'mockPostId'
        });
        expect(mockComment.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockComment);
      });
      

    it('should handle errors when creating a comment', async () => {
      req.body = { content: 'Test comment', postId: 'mockPostId' };
      const errorMessage = 'Error creating comment';
      Comment.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error(errorMessage))
      }));

      await createComment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Failed to create comment',
        error: errorMessage
      });
    });
  });

  describe('getCommentsByPost', () => {
    it('should get comments for a post', async () => {
      req.params.postId = 'mockPostId';
      const mockComments = [
        { _id: 'comment1', content: 'Comment 1' },
        { _id: 'comment2', content: 'Comment 2' }
      ];
      Comment.find = jest.fn().mockReturnThis();
      Comment.populate = jest.fn().mockReturnThis();
      Comment.sort = jest.fn().mockResolvedValue(mockComments);

      await getCommentsByPost(req, res);

      expect(Comment.find).toHaveBeenCalledWith({ post: 'mockPostId' });
      expect(Comment.populate).toHaveBeenCalledWith('author', 'username');
      expect(Comment.sort).toHaveBeenCalledWith('-createdAt');
      expect(res.json).toHaveBeenCalledWith(mockComments);
    });

    it('should handle errors when getting comments', async () => {
      req.params.postId = 'mockPostId';
      const errorMessage = 'Error getting comments';
      Comment.find = jest.fn().mockReturnThis();
      Comment.populate = jest.fn().mockReturnThis();
      Comment.sort = jest.fn().mockRejectedValue(new Error(errorMessage));

      await getCommentsByPost(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Failed to get comments',
        error: errorMessage
      });
    });
  });
});
