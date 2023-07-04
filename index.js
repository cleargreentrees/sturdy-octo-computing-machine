// Import packages
const express = require('express');
const {PoeClient} = require('poe-node-api');

// Create a client with cookie from poe.com
const client = new PoeClient({logLevel: 'debug', cookie: process.env.cookie});

// Create a web server
const app = express();

// Create a rate limiter
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many requests, please wait a minute and try again'
});

// Apply rate limiter to all requests
app.use(limiter);

// Handle url parameters
app.get('/', async (req, res) => {
  // Get the query, id and mode from the url
  const query = req.query.q;
  const id = req.query.id;
  const mode = req.query.mode;

  // Print the id to the console
  console.log(id);

  // Check if query and mode are valid
  if (query && mode) {
    // Initialize the client
    await client.init();

    // Define a map of modes to bot nicknames
    const modeMap = {
      normal: 'a2',
      standup: 'beaver',
      cowboy: 'capybara'
    };

    // Get the bot nickname from the mode
    const botNickName = modeMap[mode];

    // Check if bot nickname is valid
    if (botNickName) {
      // Send message to bot and get response
      await client.sendMessage(query, botNickName, false, (result) => {
        // Send response as json
        res.json({response: result});
      });
    } else {
      // Send error message for invalid mode
      res.json({error: 'Invalid mode'});
    }
  } else {
    // Send error message for missing query or mode
    res.json({error: 'Missing query or mode'});
  }
});

// Listen on port 3000
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
