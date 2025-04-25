// // Main application file: Express setup, middleware, routes, and data storage.
const express = require('express');
// Removed uuid import from here, it's now only needed in routes/posts.js

const app = express();

// Import routers and setters
const { router: postsRouter, setPosts: setPostsForPosts } = require('./routes/posts');
const { router: commentsRouter, setPosts: setPostsForComments } = require('./routes/comments');

// In-memory data store
let posts = [];

// Inject the posts array into the router modules
setPostsForPosts(posts);
setPostsForComments(posts); // Give comments router access too

// --- Middleware ---

// Request Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next(); // Pass control to the next middleware function
});

// JSON Body Parser (already added)
app.use(express.json());

// --- Routes ---

// Basic route (keep for testing)
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Blog API' });
});

// GET /search - Search posts by title or content
app.get('/search', (req, res) => {
  const query = req.query.q;

  // If no query parameter is provided, return empty array or maybe all posts?
  // Requirement says "Respond with matching posts or an empty array."
  // Let's return empty array if no query.
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

// GET /filter - Filter posts by author
app.get('/filter', (req, res) => {
  const author = req.query.author;

  // If no author query parameter is provided, return empty array.
  if (!author) {
    return res.json([]);
  }

  // Filter posts where the author matches exactly (case-sensitive)
  const matchingPosts = posts.filter(post => post.author === author);

  res.json(matchingPosts);
});

// Mount routers
app.use('/posts', postsRouter); 
app.use('/comments', commentsRouter); // Mount comments router

// --- Error Handling ---

// 404 Handler (should be last after all routes)
app.use((req, res, next) => {
  res.status(404).json({ error: "Resource not found" });
});

// General Error Handler (placeholder for now, from assignment requirements)
app.use((err, req, res, next) => {
  console.error(err.stack); // Log error stack trace
  res.status(500).json({ error: 'Internal Server Error' });
});


// --- Server Start ---

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 