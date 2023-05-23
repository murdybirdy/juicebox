const express = require('express');
const tagsRouter = express.Router();
const { getAllTags, getPostsByTagName } = require('../db');

tagsRouter.use((req, res, next) => {
  console.log("A request is being made to /tags");
  next();
});

tagsRouter.get('/:tagName/posts', async (req, res, next) => {
  try {
    const { tagName } = req.params;
  
    const posts = await getPostsByTagName(tagName);
    const activePosts = posts.filter(post => {
      return post.active || (req.user && post.author.id === req.user.id);
    });
  
    res.send({
      activePosts
    });

  } catch ({ name, message }) {
    next({ name, message });

  };
});

tagsRouter.get('/', async (req, res, next) => {
  try {
    res.send({
      tags
    });

  } catch ({ name, message }) {
    next({ name, message });

  };
});

module.exports = tagsRouter;