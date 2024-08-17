const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

app.get('/', (req, res) => {
  res.send('Welcome to the API! Server is running.');
});


app.use('/api/auth', authRoutes);
app.use('/api/posts', auth,postRoutes);
app.use('/api/comments', commentRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
