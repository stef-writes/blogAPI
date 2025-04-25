// // Routes for handling specific comment operations (update, delete)
const express = require('express');
const router = express.Router();

// Dependency injection for posts array
let posts;
const setPosts = (postsArray) => {
  posts = postsArray;
};

// PUT /:commentId - Update a specific comment by its ID
router.put('/:commentId', (req, res) => {
  if (!posts) return res.status(500).json({ error: 'Posts data not initialized' });
  const { commentId } = req.params;
  const { content } = req.body;

  // Basic validation for updated content
  if (content === undefined) { // Allow empty string, but not missing field
    return res.status(400).json({ error: 'Missing required field: content' });
  }

  let updatedComment = null;

  // Iterate over all posts to find the comment
  for (const post of posts) {
    const comment = post.comments.find(c => c.id === commentId);
    if (comment) {
      comment.content = content; // Update the content
      updatedComment = comment;
      break; // Found the comment, no need to check other posts
    }
  }

  if (updatedComment) {
    res.json(updatedComment); // Respond with the updated comment
  } else {
    res.status(404).json({ error: "Comment not found" });
  }
});

// DELETE /:commentId - Delete a specific comment by its ID
router.delete('/:commentId', (req, res) => {
  if (!posts) return res.status(500).json({ error: 'Posts data not initialized' });
  const { commentId } = req.params;
  let commentFound = false;

  // Iterate over all posts to find and remove the comment
  for (const post of posts) {
    const commentIndex = post.comments.findIndex(c => c.id === commentId);
    if (commentIndex !== -1) {
      post.comments.splice(commentIndex, 1); // Remove the comment
      commentFound = true;
      break; // Found and removed, no need to check other posts
    }
  }

  if (commentFound) {
    res.json({ message: "Comment deleted successfully" });
  } else {
    res.status(404).json({ error: "Comment not found" });
  }
});

module.exports = { router, setPosts }; 