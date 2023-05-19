const { Client } = require('pg'); // imports the pg module

// supply the db name and location of the database
const client = new Client('postgres://localhost:5432/juicebox-dev');

// USERS SECTION #####################################################################################
async function getAllUsers() {
  try {
    const { rows } = await client.query(`
      SELECT id, username, name, location, active FROM users;
    `)
    return rows;

  } catch (error) {
    console.log(error);
    throw error;
  }
};

async function createUser(user) {
  const { username, password, name, location } = user;
  try {
    const {rows: [user]} = await client.query(`
      INSERT INTO users (username, password, name, location)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (username) DO NOTHING
      RETURNING *;
    `, [ username, password, name, location ]);

    return user;

  } catch (error) {
    throw error;
  }
};

async function updateUser(id, fields = {}) {
  // build the set string
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }" = $${ index + 1 }`
  ).join(', ');
  // return early if this is called without fields
  if (setString.length === 0) {
    return;
  }

  try {
    const { rows: [ user ] } = await client.query(`
      UPDATE users
      SET ${ setString }
      WHERE ID=${id}
      RETURNING *;
    `, Object.values(fields));

    return user;
  } catch (error) {
    throw error;
  }
}

async function getUserById(userId) {
  try {
    const { rows: [ user ] } = await client.query(`
      SELECT * FROM users
      WHERE ID = ${userId} 
    `);

    if (!user) {
      return {
        error: true,
        message: "incorrect credentials"
      };
    } else {
      delete user.password;
      const posts = await getPostsByUser(user.id);
      console.log(posts);
      user.posts = posts;
      
      return user;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// POSTS SECTION #####################################################################################
async function getAllPosts() {
  try {
    const { rows } = await client.query(`
      SELECT id, "authorId", title, content, active FROM posts;
    `);
    return rows;

  } catch (error) {
    console.log(error);
    throw error;
  }
};

async function getPostsByUser(userid) {
  try {
    const { rows } = await client.query(`
      SELECT * FROM posts
      WHERE "authorId"=$1;
    `, [userid]);

    return rows;
    
  } catch (error) {
    console.log(error);
    throw error;
  }
};

async function createPost(post) {
  const { authorId, title, content } = post;
  try {
    const {rows: [post]} = await client.query(`
      INSERT INTO posts ("authorId", title, content)
      VALUES ($1, $2, $3)
      RETURNING *;
    `, [ authorId, title, content ]);

    return post;

  } catch (error) {
    console.log(error);
    throw error;
  }
};

async function updatePost(id, fields = {}.filter(key => key != "authorId")) {
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }" = $${ index + 1 }`
  ).join(', ');
  console.log(setString);

  if (setString.length === 0) {
    return;
  }

  try {
    const { rows: [ post ] } = await client.query(`
      UPDATE posts
      SET ${ setString }
      WHERE ID=${id} 
      RETURNING *;
    `, Object.values(fields));

    return post;

  } catch (error) {
    console.log(error);
    throw error;
  }
}

module.exports = {
  client,
  getAllUsers,
  createUser,
  updateUser,
  getUserById,
  getAllPosts,
  getPostsByUser,
  createPost,
  updatePost
}