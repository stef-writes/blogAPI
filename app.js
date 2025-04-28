// // Main application file: Express setup, middleware, routes, and data storage.
const express = require('express');
// Import validation middleware
const { validatePost, validateComment } = require('./middleware/validation');

const app = express();

// Import routers and setters
const { router: postsRouter, setPosts: setPostsForPosts } = require('./routes/posts');
const { router: commentsRouter, setPosts: setPostsForComments } = require('./routes/comments');

// In-memory data store
let posts = [];

// Inject the posts array into the router modules
setPostsForPosts(posts);
setPostsForComments(posts); // Give comments router access too

// Expose validation middleware to routes
module.exports = { validatePost, validateComment };

// --- Middleware ---

// Request Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next(); // Pass control to the next middleware function
});

// JSON Body Parser (already added)
app.use(express.json());

// --- Routes ---

// Basic route 
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Blog API' });
});

// GET /search 
app.get('/search', (req, res) => {
  const query = req.query.q;


  if (!query) {
    return res.json([]);
  }

  const searchTerm = query.toLowerCase(); // Case-insensitive search

  const matchingPosts = posts.filter(post => {
    const titleMatch = post.title.toLowerCase().includes(searchTerm);
    const contentMatch = post.content.toLowerCase().includes(searchTerm);
    return titleMatch || contentMatch;
  });

  res.json(matchingPosts);
});

// GET /filter - Filter posts by author and/or tag
app.get('/filter', (req, res) => {
  const { author, tag } = req.query;

  // If no filter parameters are provided, return empty array
  if (!author && !tag) {
    return res.json([]);
  }

  let filteredPosts = [...posts]; // Start with all posts

  // Apply author filter if provided (exact match, case-sensitive)
  if (author) {
    filteredPosts = filteredPosts.filter(post => post.author === author);
  }

  // Apply tag filter if provided
  if (tag) {
    filteredPosts = filteredPosts.filter(post => 
      Array.isArray(post.tags) && post.tags.includes(tag)
    );
  }

  res.json(filteredPosts);
});

// Mount routers
app.use('/posts', postsRouter); 
app.use('/comments', commentsRouter); 

// --- Error Handling ---

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ error: "Resource not found" });
});

// General Error Handlerts)
app.use((err, req, res, next) => {
  console.error(err.stack); 
  res.status(500).json({ error: 'Internal Server Error' });
});


// --- Server Start ---

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 