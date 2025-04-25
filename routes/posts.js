// Routes for handling blog post operations (CRUD)
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid'); // Still need UUID for creating posts

// We need access to the posts array from app.js
// This is a simplified approach for in-memory data.
// In a real app, you might use a database or a dedicated data service.
let posts; // Will be set by app.js

// Function to inject the posts array (dependency injection)
const setPosts = (postsArray) => {
  posts = postsArray;
};

// --- Blog Post Routes (relative to /posts) ---

// GET / - Retrieve all blog posts
router.get('/', (req, res) => {
  if (!posts) return res.status(500).json({ error: 'Posts data not initialized' });
  res.json(posts); // Return the full array of posts
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
    likes: 0, // Initialize likes
    comments: [] // Initialize comments
  };

  posts.push(newPost); // Add to in-memory array
  res.status(201).json(newPost); // Respond with created post and 201 status
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

  // Update fields if they are provided in the request body
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

// DELETE /:id - Delete a specific blog post by ID
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

// POST /:id/comment - Add a comment to a specific blog post
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
    id: uuidv4(), // Generate unique ID for the comment
    author,
    content
  };

  // Add the comment to the post's comments array
  post.comments.push(newComment);

  // Respond with the updated post (or just the comment)
  // Returning the updated post is often useful for the client
  res.status(201).json(post); 
});

// GET /:id/comments - Retrieve all comments for a specific blog post
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

// POST /:id/like - Increment the like count for a specific blog post
router.post('/:id/like', (req, res) => {
  if (!posts) return res.status(500).json({ error: 'Posts data not initialized' });
  const { id } = req.params; // Post ID

  // Find the post
  const post = posts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  // Increment the likes count
  post.likes++; // Simple increment

  // Respond with the updated like count
  res.json({ likes: post.likes });
});

module.exports = { router, setPosts }; // Export the router and the setter function
