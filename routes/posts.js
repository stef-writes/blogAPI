// Routes for handling blog post operations (CRUD)
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid'); 


let posts; 

const setPosts = (postsArray) => {
  posts = postsArray;
};

// --- Blog Post Routes (relative to /posts) ---

// GET / - Retrieve all blog posts
router.get('/', (req, res) => {
  if (!posts) return res.status(500).json({ error: 'Posts data not initialized' });
  res.json(posts); 
});

// GET /:id - Retrieve a specific blog post by ID
router.get('/:id', (req, res) => {
  if (!posts) return res.status(500).json({ error: 'Posts data not initialized' });
  const { id } = req.params;
  const post = posts.find(p => p.id === id);

  if (post) {
    res.json(post);
  } else {
    res.status(404).json({ error: "Post not found" });
  }
});

// POST / - Create a new blog post
router.post('/', (req, res) => {
  if (!posts) return res.status(500).json({ error: 'Posts data not initialized' });
  const { title, author, content } = req.body;

  // Basic validation
  if (!title || !author || !content) {
    return res.status(400).json({ error: 'Missing required fields: title, author, content' });
  }

  const newPost = {
    id: uuidv4(), // Generate unique ID
    title,
    author,
    publicationDate: new Date(), // Use current date
    readTime: Math.ceil(content.length / 200), // Calculate read time
    content,
    likes: 0, 
    comments: []
  };

  posts.push(newPost);
  res.status(201).json(newPost); 
});

// PUT /:id - Update an existing blog post by ID
router.put('/:id', (req, res) => {
  if (!posts) return res.status(500).json({ error: 'Posts data not initialized' });
  const { id } = req.params;
  const { title, author, content } = req.body;

  const postIndex = posts.findIndex(p => p.id === id);

  if (postIndex === -1) {
    return res.status(404).json({ error: "Post not found" });
  }

  // Get the existing post
  const post = posts[postIndex];

  const updatedPost = {
    ...post,
    title: title !== undefined ? title : post.title,
    author: author !== undefined ? author : post.author,
    content: content !== undefined ? content : post.content,
    readTime: content !== undefined ? Math.ceil(content.length / 200) : post.readTime,
  };

  posts[postIndex] = updatedPost;
  res.json(updatedPost);
});

// DELETE /:id
router.delete('/:id', (req, res) => {
  if (!posts) return res.status(500).json({ error: 'Posts data not initialized' });
  const { id } = req.params;
  const postIndex = posts.findIndex(p => p.id === id);

  if (postIndex === -1) {
    return res.status(404).json({ error: "Post not found" });
  }

  posts.splice(postIndex, 1);
  res.json({ message: "Post deleted successfully" });
});

// POST /:id/comment
router.post('/:id/comment', (req, res) => {
  if (!posts) return res.status(500).json({ error: 'Posts data not initialized' });
  const { id } = req.params; // Post ID
  const { author, content } = req.body;

  // Find the post
  const post = posts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  // Basic validation for comment
  if (!author || !content) {
    return res.status(400).json({ error: 'Missing required fields: author, content' });
  }

  // Create the new comment
  const newComment = {
    id: uuidv4(), 
    author,
    content
  };

  // Add the comment to the post's comments array
  post.comments.push(newComment);


  res.status(201).json(post); 
});

// GET /:id/comments
router.get('/:id/comments', (req, res) => {
  if (!posts) return res.status(500).json({ error: 'Posts data not initialized' });
  const { id } = req.params; // Post ID

  // Find the post
  const post = posts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  // Respond with the comments array for that post
  res.json(post.comments);
});

// POST /:id/like
router.post('/:id/like', (req, res) => {
  if (!posts) return res.status(500).json({ error: 'Posts data not initialized' });
  const { id } = req.params; // Post ID

  // Find the post
  const post = posts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  // Increment the likes count
  post.likes++; 

  
  res.json({ likes: post.likes });
});

module.exports = { router, setPosts }; 