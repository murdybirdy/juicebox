// grab our client with destructuring from the export in index.js'
const { 
  client, 
  getAllUsers, 
  createUser, 
  updateUser,
  getUserById,
  getAllPosts,
  getPostsByUser,
  createPost,
  updatePost
 } = require('./index');

// This function should call a query which drops all tables from our database
async function dropTables() {
  try {
    console.log("Starting to drop tables...");
    
    // DROP TABLE IF EXISTS user_posts;
    await client.query(`
      DROP TABLE IF EXISTS posts;
      DROP TABLE IF EXISTS users;
    `);

    console.log("Finished dropping tables!");
  } catch (error) {
    console.error("Error dropping tables!");
    throw error; // we pass the error up to the function that calls dropTables
  }
}

// This function should call a query which creates all tables for our database
async function createTables() {
  try {
    console.log("Starting to build tables...");

    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        active BOOLEAN DEFAULT true
      );
    `);

    await client.query(`
      CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        "authorId" INTEGER REFERENCES users(id) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        active BOOLEAN DEFAULT true
      );
    `);

    // await client.query(`
    //     CREATE TABLE user_posts (
    //       id SERIAL PRIMARY KEY,
    //       "userId" INTEGER REFERENCES users(id),
    //       "postsId" INTEGER REFERENCES posts(id)
    //     );
    // `);
    console.log("Finished building tables!");
  } catch (error) {
    console.log("Error building tables!");
    throw error;
  }
}

async function createInitialUsers() {
  try {
    console.log("Starting to create users...");

    await createUser({ username: 'albert', password: 'bertie99', name: 'Albert', location: 'Mexico' });
    await createUser({ username: 'sandra', password: '2sandy4me', name: 'Sandra', location: 'United States' });
    await createUser({ username: 'glamgal', password: 'soglam', name: 'Gal', location: 'Israel' });

    console.log("Finished creating users!");
  } catch (error) {
    console.log("Error creating users!");
    throw error;
  }
}

async function createInitialPosts() {
  try {
    const [albert, sandra, glamgal] = await getAllUsers();

    await createPost({
      authorId: albert.id,
      title: "First Post",
      content: "This is my first post. I hope I ove wrtiing blogs as much as I love writing them."
    });

    await createPost({
      authorId: albert.id,
      title: "Second Post",
      content: "This is my 2nd post. I hope I ove wrtiing blogs as much as I love writing them."
    });

    await createPost({
      authorId: albert.id,
      title: "Third Post",
      content: "This is my third post. I hope I ove wrtiing blogs as much as I love writing them."
    });

  } catch (error) {

  }
}

async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers();
    await createInitialPosts();

  } catch (error) {
    throw error;
  }
}

async function testDB() {
  try {
    // connect the client to the database, finally
    console.log("Starting to test database...");

    // queries are promises, so we can await them
    console.log("Calling getAllUsers");
    const users = await getAllUsers();

    // for now, logging is a fine way to see what's up
    console.log("getAllUsers:", users);

    console.log("Calling updateUser on users[0]");
    const updateUserResult = await updateUser(users[0].id, {name: 'Newname soGood', location: 'Lesterville, KY'});
    console.log("Result:", updateUserResult);

    console.log("Calling getAllPosts");
    const posts = await getAllPosts();
    console.log("Result:", posts);

    console.log("Calling updatePost on posts[0]");
    const updatePostResult = await updatePost(posts[0].id, {
      title: "New Title",
      content: "updated Content"
    });
    console.log("Result:", updatePostResult);

    console.log("Calling getUserByID with 1");
    const albert = await getUserById(1);
    console.log("Result:", albert);

    console.log("Finished database tests!");
  } catch (error) {
    console.log("Error testing database!");
    throw error;
  } 
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());