// // Main application file
const express = require('express');
const app = express();

// Import routers and setters
const { router: postsRouter, setPosts: setPostsForPosts } = require('./routes/posts');
const { router: commentsRouter, setPosts: setPostsForComments } = require('./routes/comments');

// In-memory data store
let posts = [];

setPostsForPosts(posts);
setPostsForComments(posts); 

// --- Middleware ---

// Request Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
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

// GET /filter
app.get('/filter', (req, res) => {
  const author = req.query.author;

  
  if (!author) {
    return res.json([]);
  }

  // Filter posts where the author matches
  const matchingPosts = posts.filter(post => post.author === author);

  res.json(matchingPosts);
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