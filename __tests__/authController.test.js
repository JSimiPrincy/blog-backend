// tests/authController.test.js
const { register, login } = require('../controllers/authController');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

jest.mock('../models/User');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      req.body = { username: 'testuser', email: 'test@example.com', password: 'password123' };
      User.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue()
      }));

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'User registered successfully' });
    });

    it('should return an error if registration fails', async () => {
      req.body = { username: 'testuser', email: 'test@example.com', password: 'password123' };
      User.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('Registration failed'))
      }));

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Registration failed', error: 'Registration failed' });
    });
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      const mockUser = {
        _id: 'user123',
        comparePassword: jest.fn().mockResolvedValue(true)
      };
      User.findOne = jest.fn().mockResolvedValue(mockUser);
      jwt.sign = jest.fn().mockReturnValue('mockToken');

      await login(req, res);

      expect(res.json).toHaveBeenCalledWith({ token: 'mockToken', userId: 'user123' });
    });

    it('should return an error for invalid credentials', async () => {
      req.body = { email: 'test@example.com', password: 'wrongpassword' };
      const mockUser = {
        comparePassword: jest.fn().mockResolvedValue(false)
      };
      User.findOne = jest.fn().mockResolvedValue(mockUser);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });
  });
});
