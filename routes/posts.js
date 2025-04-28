// Routes for handling blog post operations (CRUD)
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid'); 
const { validatePost, validateComment } = require('../middleware/validation');

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
router.post('/', validatePost, (req, res) => {
  if (!posts) return res.status(500).json({ error: 'Posts data not initialized' });
  const { title, author, content, tags } = req.body;

  // Validation now handled by validatePost middleware in app.js
  
  const newPost = {
    id: uuidv4(), // Generate unique ID
    title,
    author,
    publicationDate: new Date(), // Use current date
    readTime: Math.ceil(content.length / 200), // Calculate read time
    content,
    tags: Array.isArray(tags) ? tags : [], // Add tags array (empty if not provided)
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
  const { title, author, content, tags } = req.body;

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
    tags: tags !== undefined ? (Array.isArray(tags) ? tags : []) : post.tags,
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

// POST /:id/comment - Add a comment to a specific blog post
router.post('/:id/comment', validateComment, (req, res) => {
  if (!posts) return res.status(500).json({ error: 'Posts data not initialized' });
  const { id } = req.params; // Post ID
  const { author, content } = req.body;

  // Find the post
  const post = posts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  // Validation now handled by validateComment middleware in app.js
  
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

// POST /:id/like - Toggle the like count for a specific blog post
router.post('/:id/like', (req, res) => {
  if (!posts) return res.status(500).json({ error: 'Posts data not initialized' });
  const { id } = req.params; // Post ID

  // Find the post
  const post = posts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  // Toggle likes by tracking like state in the request
  // In a real app, you'd track which users liked which posts
  // For this simple implementation, we'll toggle based on a "liked" property from request
  const { unlike } = req.body;
  
  if (unlike) {
    // If unlike is true, decrement likes (but not below 0)
    post.likes = Math.max(0, post.likes - 1);
  } else {
    // Otherwise increment
    post.likes++;
  }

  // Respond with the updated like count
  res.json({ likes: post.likes });
});

module.exports = { router, setPosts }; 