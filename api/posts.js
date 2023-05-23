const express = require('express');
const postsRouter = express.Router();
const { getAllPosts, createPost, updatePost, getPostById } = require('../db');
const { requireUser } = require('./utils');

postsRouter.use((req, res, next) => {
  console.log("A request is being made to /posts");
  next();
});

  postsRouter.post('/', requireUser, async (req, res, next) => { // Create new Post
  const { title, content, tags = "" } = req.body;

  const tagArray = tags.trim().split(/\s+/);
  const postData = {};

  if (tagArray.length) {
    postData.tags = tagArray;
  }

  try {
    postData.authorId = req.user.id
    postData.title = title;
    postData.content = content;

    const post = await createPost(postData);
    
    if (post) {
      res.send({ post });
    } else {
      next({
        name: "ErrorCreatingPost",
        message: "Insufficient data provided to create post"
      })
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.patch('/:postId', requireUser, async (req, res, next) => {  // Update Post
  const { postId } = req.params;
  const { title, content, tags } = req.body;

  const updateFields = {};

  if (tags && tags.length > 0) {
    updateFields.tags = tags.trim().split(/\s+/);
  };

  if (title) {
    updateFields.title = title;
  };

  if (content) {
    updateFields.content = content;
  };

  try {
    const originalPost = await getPostById(postId);
    console.log(originalPost);
    if (originalPost.author.id === req.user.id) {
      const updatedPost = await updatePost(postId, updateFields);
      res.send({ post: updatedPost });
    } else {
      next({
        name: "UnauthorizedAuthorError",
        message: "You are not the author of this post!"
      });
    };

  } catch ({ name, message }) {
    next({ name, message });
  };

});

postsRouter.delete('/:postId', requireUser, async (req, res, next) => {
  const { postId } = req.params;
  try {
    const post = await getPostById(postId);

    if (post && post.author.id === req.user.id) {
      const updatedPost = await updatePost(postId, { active: false });

      res.send({ post: updatedPost });
    } else {
      next(
        post ?
        {
          name: "UnauthorizedUserError",
          message: "You cannot delete a post which is not yours"
        } :
        {
          name: "PostNotFoundError",
          message: "That post does not exist"
        });
    }

  } catch ({ name, message }) {
    next({ name, message });
  };
});

postsRouter.get('/', async (req, res, next) => {
  try {
    const allPosts = await getAllPosts();

    const posts = allPosts.filter(post => {
      return post.active || (req.user && post.author.id === req.user.id);
    });
    
    res.send({
      posts
    });

  } catch ({ name, message }) {
    next({ name, message });
    
  };
});

module.exports = postsRouter;