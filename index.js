require('dotenv').config();
const PORT = 3000;  // setting up port and getting express
const express = require('express');
const server = express();

const morgan = require('morgan'); // setting up morgan (middleware)
server.use(morgan('dev'));
server.use(express.json());

const apiRouter = require('./api'); // setting up the /api route
server.use('/api', apiRouter);

const { client } = require('./db'); // pulling the data from our /db folder
client.connect();

server.listen(PORT, () => {
  console.log("The server is up on port ", PORT);
});

server.use((req, res, next) => {
  console.log("<____Body Logger START____>");
  console.log(req.body);
  console.log("<_____Body Logger END_____>");

  next();
});

server.get('/background/:color', (req, res, next) => { // Sets "color" as a variable; whatever follows /background/ will take the place of req.params.color
  res.send(`
    <body style="background: ${ req.params.color };">
      <h1>Hello World</h1>
    </body>
  `);
});

server.get('/add/:first/to/:second', (req, res, next) => {
  res.send(`
    <h1>
      ${ req.params.first } + ${ req.params.second } =
      ${ Number(req.params.first) + Number(req.params.second)}
    </h1>
  `);
});
  // ^ running the above like this: curl localhost:3000/add/3/to/11
    // yields this:
      //   <h1>
      //    3 + 11 =
      //    14
      //  </h1>