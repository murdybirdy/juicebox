const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

const express = require('express');
const usersRouter = express.Router();
const { getAllUsers, getUserByUsername, createUser } = require('../db');

usersRouter.use((req, res, next) => {
  console.log("A request is being made to /users");
  next();
});

usersRouter.get('/', async (req, res) => {
  const users = await getAllUsers();

  res.send({
    users
  });
});

usersRouter.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password"
    });
  }

  try {
    const user = await getUserByUsername(username);
    console.log(user.password);

    if (user && user.password == password) {
      const token = jwt.sign({id: user.id, username: user.username}, JWT_SECRET);
      res.send({ message: "You're logged in!", token, error: false});

    } else {
      next({
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect"
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  };

});

usersRouter.post('/register', async (req, res, next) => {
  const {username, password, name, location } = req.body;

  try {
    const _user = await getUserByUsername(username);

    if (_user) {
      next({
        name: "DuplicateUsernameError",
        message: "This username already exists - please register with a different username"
      });
    } else {
      const user = await createUser({username: username, password: password, name: name, location: location});
      const token = jwt.sign({id: user.id, username: user.username}, JWT_SECRET, {expiresIn: '1w'});

      res.send({message: "Thank you for signing up!", token, error: false});
    }
  } catch ({name, message}) {
    next({name, message})
  }
});

module.exports = usersRouter;