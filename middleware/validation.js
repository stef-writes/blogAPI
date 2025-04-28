// Validation middleware functions

// Validate post creation/update payload
const validatePost = (req, res, next) => {
  const { title, author, content } = req.body;
  if (!title || !author || !content) {
    return res.status(400).json({ error: 'Missing required fields: title, author, content' });
  }
  next();
};

// Validate comment creation/update payload
const validateComment = (req, res, next) => {
  const { author, content } = req.body;
  if (!author || !content) {
    return res.status(400).json({ error: 'Missing required fields: author, content' });
  }
  next();
};

module.exports = { validatePost, validateComment };
