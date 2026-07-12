const serverless = require('serverless-http');
const app = require('./server');

// AWS Lambda entry handler
module.exports.handler = serverless(app);
