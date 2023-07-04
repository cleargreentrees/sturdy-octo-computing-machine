// Import modules
import express from "express";
import {PoeClient} from "poe-node-api";
import dotenv from "dotenv";

// Load .env file
dotenv.config();

// Create Express app
const app = express();

// Create PoeClient instance
const client = new PoeClient({cookie: process.env.cookie});

// Create bot map
const botMap = new Map([
  ["normal", {nick: "a2", display: "Claude-instant"}],
  ["standup", {nick: "beaver", display: "GPT-4"}],
  ["cowboy", {nick: "capybara", display: "Sage"}]
]);

// Create rate limit middleware
let requestCount = 0;
let startTime = Date.now();
const rateLimit = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Increment request count
  requestCount++;
  // Get current time
  let currentTime = Date.now();
  // Check if one minute has passed
  if (currentTime - startTime >= 60000) {
    // Reset request count and start time
    requestCount = 0;
    startTime = currentTime;
  }
  // Check if request count exceeds limit
  if (requestCount > 10) {
    // Send response with status code 429 and message
    res.status(429).send("Too many requests. Please wait for one minute.");
  } else {
    // Call next function
    next();
  }
};

// Create API route
app.get("/", rateLimit, async (req: express.Request, res: express.Response) => {
  try {
    // Get query parameters
    const input = req.query.q as string;
    const id = req.query.id as string;
    const mode = req.query.mode as string;
    // Print id to console
    console.log(id);
    // Get bot info from map
    const botInfo = botMap.get(mode);
    // Check if mode is valid
    if (!botInfo) {
      // Send response with status code 400 and message
      res.status(400).send("Invalid mode. Please enter normal, standup, or cowboy.");
      return;
    }
    // Initialize client
    await client.init();
    // Send message to bot and get response
    await client.sendMessage(input, botInfo.nick, false, (result: string) => {
      // Send response with status code 200 and JSON object
      res.status(200).json({bot: botInfo.display, response: result});
    });
  } catch (error) {
    // Send response with status code 500 and error message
    res.status(500).send(error.message);
  }
});

// Start server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
