// Vercel Serverless Function entry point
// This wraps the entire Express app so Vercel can handle it as a single serverless function.
const app = require('../backend/server');

module.exports = app;
