// postController.test.js
const mongoose = require('mongoose');
const { getAllPosts, getPostById, createPost, updatePost, deletePost } = require('../controllers/postController');
const Post = require('../models/Post');

// Mock the Post model
jest.mock('../models/Post');

describe('Post Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      user: { _id: 'mockUserId', username: 'mockUsername' },
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

  describe('getAllPosts', () => {
    it('should get all posts', async () => {
      const mockPosts = [
        { _id: 'post1', title: 'Post 1' },
        { _id: 'post2', title: 'Post 2' }
      ];
      Post.find = jest.fn().mockReturnThis();
      Post.sort = jest.fn().mockResolvedValue(mockPosts);

      await getAllPosts(req, res);

      expect(Post.find).toHaveBeenCalled();
      expect(Post.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.json).toHaveBeenCalledWith(mockPosts);
    });

    it('should handle errors when getting all posts', async () => {
      const errorMessage = 'Error getting posts';
      Post.find = jest.fn().mockReturnThis();
      Post.sort = jest.fn().mockRejectedValue(new Error(errorMessage));

      await getAllPosts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe('getPostById', () => {
    it('should get a post by id', async () => {
      req.params.id = 'validPostId';
      const mockPost = { _id: 'validPostId', title: 'Test Post' };
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      Post.findById = jest.fn().mockResolvedValue(mockPost);

      await getPostById(req, res);

      expect(Post.findById).toHaveBeenCalledWith('validPostId');
      expect(res.json).toHaveBeenCalledWith(mockPost);
    });

    it('should return 400 for invalid post id', async () => {
      req.params.id = 'invalidPostId';
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);

      await getPostById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid post ID' });
    });

    it('should return 404 if post not found', async () => {
      req.params.id = 'nonExistentPostId';
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      Post.findById = jest.fn().mockResolvedValue(null);

      await getPostById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Post not found' });
    });
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      req.body = { title: 'Test Post', content: 'Test Content' };
      const mockPost = {
        title: 'Test Post',
        content: 'Test Content',
        author: {
          id: 'mockUserId',
          username: 'mockUsername'
        },
        save: jest.fn().mockResolvedValue()
      };
      Post.mockImplementation(() => mockPost);

      await createPost(req, res);

      expect(Post).toHaveBeenCalledWith({
        title: 'Test Post',
        content: 'Test Content',
        author: {
          id: 'mockUserId',
          username: 'mockUsername'
        }
      });
      expect(mockPost.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockPost);
    });

    it('should handle errors when creating a post', async () => {
      req.body = { title: 'Test Post', content: 'Test Content' };
      const errorMessage = 'Error creating post';
      Post.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error(errorMessage))
      }));

      await createPost(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Failed to create post',
        error: errorMessage
      });
    });
  });

  describe('updatePost', () => {
    it('should update a post', async () => {
        req.params.id = 'validPostId';
        req.body = { title: 'Updated Title', content: 'Updated Content' };
        const mockPost = {
          title: 'Old Title',
          content: 'Old Content',
          save: jest.fn().mockResolvedValue({
            title: 'Updated Title',
            content: 'Updated Content'
          })
        };
        mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
        Post.findById = jest.fn().mockResolvedValue(mockPost);
      
        await updatePost(req, res);
      
        expect(mockPost.title).toBe('Updated Title');
        expect(mockPost.content).toBe('Updated Content');
        expect(mockPost.save).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({
          title: 'Updated Title',
          content: 'Updated Content'
        });
      });
      
  });
  

  describe('deletePost', () => {
    it('should delete a post', async () => {
      req.params.id = 'validPostId';
      const mockPost = {
        remove: jest.fn().mockResolvedValue()
      };
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      Post.findById = jest.fn().mockResolvedValue(mockPost);

      await deletePost(req, res);

      expect(mockPost.remove).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Post deleted successfully' });
    });

    it('should return 400 for invalid post id', async () => {
      req.params.id = 'invalidPostId';
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);

      await deletePost(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid post ID' });
    });

    it('should return 404 if post not found', async () => {
      req.params.id = 'nonExistentPostId';
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      Post.findById = jest.fn().mockResolvedValue(null);

      await deletePost(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Post not found' });
    });
  });
});
