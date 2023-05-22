// grab our client with destructuring from the export in index.js'
const { 
  client, 
  getAllUsers, 
  createUser, 
  updateUser,
  getUserById,
  getAllPosts,
  createPost,
  updatePost,
  createTags,
  addTagsToPost,
  getPostsByTagName
 } = require('./index');

// This function should call a query which drops all tables from our database
async function dropTables() {
  try {
    console.log("Starting to drop tables...");
    
    // DROP TABLE IF EXISTS user_posts;
    await client.query(`
      DROP TABLE IF EXISTS post_tags;
      DROP TABLE IF EXISTS posts;
      DROP TABLE IF EXISTS users;
      DROP TABLE IF EXISTS tags;
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

    await client.query(`
      CREATE TABLE tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE post_tags (
        "postId" INTEGER REFERENCES posts(id),
        "tagId" INTEGER REFERENCES tags(id),
        UNIQUE ("postId", "tagId")
      );
    `)

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

    console.log("Starting to create Posts!");

    await createPost({
      authorId: albert.id,
      title: "First Post",
      content: "This is my first post. I hope I love writing blogs as much as I love writing them.",
      tags: ["#happy", "#youcandoanything"]
    });

    // await createPost({
    //   authorId: albert.id,
    //   title: "Second Post",
    //   content: "This is my 2nd post. I hope I love writing blogs as much as I love writing them."
    // });

    // await createPost({
    //   authorId: albert.id,
    //   title: "Third Post",
    //   content: "This is my third post. I hope I love writing blogs as much as I love writing them."
    // });
    await createPost({
      authorId: sandra.id,
      title: "How does this work?",
      content: "Seriously, does this even do anything?",
      tags: ["#happy", "#worst-day-ever"]
    });
    await createPost({
      authorId: glamgal.id,
      title: "Living the Glam Life",
      content: "Do you even? I swear that half of you are posing.",
      tags: ["#happy", "#youcandoanything", "#canmandoeverything"]
    });

    console.log("Finished creating Posts!");

  } catch (error) {
    console.log(error);
    throw error;
  }
}

// async function createInitialTags() {
//   try {
//     console.log("Starting to create tags...");

//     const [happy, sad, inspo, catman] = await createTags([
//       '#happy',
//       '#worst-day-ever',
//       '#youcandoaything',
//       '#catmandoeverything'
//     ]);

//     const [postOne, postTwo, postThree] = await getAllPosts();

//     await addTagsToPost(postOne.id, [happy, inspo]);
//     await addTagsToPost(postTwo.id, [sad, inspo]);
//     await addTagsToPost(postThree.id, [happy, catman, inspo]);

//     console.log("Finished creating tags!");

//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// }

async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers();
    await createInitialPosts();

  } catch (error) {
    console.log(error);
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

    console.log("Calling updatePost on posts[1], only updating tags");
    const updatePostTagsResult = await updatePost(posts[1].id, {
      tags: ["#youcandoanything", "#redfish", "#bluefish"]
    });
    console.log("Result:", posts[1], updatePostTagsResult);

    console.log("Calling getUserByID with 1");
    const albert = await getUserById(1);
    console.log("Result:", albert.posts[0].tags);

    console.log("Calling getPostsByTagName with #happy");
    const postsWithHappy = await getPostsByTagName("#happy");
    console.log("Result:", postsWithHappy);

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